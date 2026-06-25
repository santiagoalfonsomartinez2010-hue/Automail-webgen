// =============================================
// database.js - Configuración SQLite y queries
// =============================================

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database.sqlite';

let db;

// Inicializa la base de datos y crea las tablas si no existen
function inicializarDB() {
  db = new Database(path.resolve(DB_PATH));

  // Activar claves foráneas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Crear todas las tablas
  db.exec(`
    -- Configuración del empleado IA
    CREATE TABLE IF NOT EXISTS config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      nombre_empleada TEXT DEFAULT 'Sofía',
      empresa TEXT DEFAULT 'Mi Empresa',
      tono TEXT DEFAULT 'neutro',
      foto_url TEXT,
      sheet_id TEXT,
      reglas_escalado TEXT DEFAULT '{"importeMaximo": 200, "categorias": ["legal", "fraude", "tecnico_avanzado"], "palabrasClave": ["abogado", "denuncia", "robo", "fraude"]}',
      onboarding_completado INTEGER DEFAULT 0,
      gmail_conectado INTEGER DEFAULT 0,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Insertar config inicial si no existe
    INSERT OR IGNORE INTO config (id) VALUES (1);

    -- Clientes
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      empresa TEXT,
      notas TEXT,
      es_vip INTEGER DEFAULT 0,
      instrucciones_vip TEXT,
      primera_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
      ultima_consulta DATETIME DEFAULT CURRENT_TIMESTAMP,
      total_tickets INTEGER DEFAULT 0
    );

    -- Tickets de soporte
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      email_id TEXT UNIQUE,
      asunto TEXT NOT NULL,
      categoria TEXT DEFAULT 'consulta',
      urgencia TEXT DEFAULT 'normal',
      estado TEXT DEFAULT 'pendiente',
      email_original TEXT,
      respuesta_enviada TEXT,
      notas_internas TEXT,
      confianza_ia INTEGER DEFAULT 0,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_respuesta DATETIME,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    -- Registro de acciones del empleado
    CREATE TABLE IF NOT EXISTS acciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      datos_extra TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    );

    -- Caché de Google Sheets
    CREATE TABLE IF NOT EXISTS cache_sheets (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL,
      ultima_sync DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Mensajes del chat con el empresario
    CREATE TABLE IF NOT EXISTS chat_mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rol TEXT NOT NULL,
      contenido TEXT NOT NULL,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Base de datos inicializada correctamente');
  return db;
}

// ---- QUERIES DE CONFIGURACIÓN ----

function obtenerConfig() {
  return db.prepare('SELECT * FROM config WHERE id = 1').get();
}

function actualizarConfig(datos) {
  const campos = Object.keys(datos).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE config SET ${campos} WHERE id = 1`).run(datos);
  return obtenerConfig();
}

// ---- QUERIES DE CLIENTES ----

function obtenerClientes(limite = 100) {
  return db.prepare(`
    SELECT c.*, COUNT(t.id) as total_tickets
    FROM clientes c
    LEFT JOIN tickets t ON t.cliente_id = c.id
    GROUP BY c.id
    ORDER BY c.ultima_consulta DESC
    LIMIT ?
  `).all(limite);
}

function obtenerClientePorEmail(email) {
  return db.prepare('SELECT * FROM clientes WHERE email = ?').get(email);
}

function crearOActualizarCliente(datos) {
  const existente = obtenerClientePorEmail(datos.email);
  if (existente) {
    db.prepare(`
      UPDATE clientes SET
        nombre = @nombre,
        telefono = COALESCE(@telefono, telefono),
        ultima_consulta = CURRENT_TIMESTAMP,
        total_tickets = total_tickets + 1
      WHERE email = @email
    `).run(datos);
    return obtenerClientePorEmail(datos.email);
  } else {
    const result = db.prepare(`
      INSERT INTO clientes (nombre, email, telefono, empresa)
      VALUES (@nombre, @email, @telefono, @empresa)
    `).run(datos);
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(result.lastInsertRowid);
  }
}

// ---- QUERIES DE TICKETS ----

function obtenerTickets(filtros = {}) {
  let query = `
    SELECT t.*, c.nombre as cliente_nombre, c.email as cliente_email, c.es_vip
    FROM tickets t
    LEFT JOIN clientes c ON c.id = t.cliente_id
  `;
  const condiciones = [];
  const params = [];

  if (filtros.fecha) {
    condiciones.push("DATE(t.fecha) = DATE(?)");
    params.push(filtros.fecha);
  }
  if (filtros.estado) {
    condiciones.push("t.estado = ?");
    params.push(filtros.estado);
  }
  if (condiciones.length > 0) {
    query += ' WHERE ' + condiciones.join(' AND ');
  }
  query += ' ORDER BY t.fecha DESC LIMIT 200';

  return db.prepare(query).all(...params);
}

function obtenerTicketsDeHoy() {
  return db.prepare(`
    SELECT t.*, c.nombre as cliente_nombre, c.email as cliente_email, c.es_vip
    FROM tickets t
    LEFT JOIN clientes c ON c.id = t.cliente_id
    WHERE DATE(t.fecha) = DATE('now')
    ORDER BY t.fecha DESC
  `).all();
}

function obtenerTicketsDeCliente(clienteId) {
  return db.prepare(`
    SELECT * FROM tickets
    WHERE cliente_id = ?
    ORDER BY fecha DESC
    LIMIT 10
  `).all(clienteId);
}

function crearTicket(datos) {
  const result = db.prepare(`
    INSERT INTO tickets (
      cliente_id, email_id, asunto, categoria, urgencia, estado,
      email_original, respuesta_enviada, notas_internas, confianza_ia
    ) VALUES (
      @cliente_id, @email_id, @asunto, @categoria, @urgencia, @estado,
      @email_original, @respuesta_enviada, @notas_internas, @confianza_ia
    )
  `).run(datos);
  return db.prepare('SELECT * FROM tickets WHERE id = ?').get(result.lastInsertRowid);
}

function actualizarTicket(id, datos) {
  const campos = Object.keys(datos).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE tickets SET ${campos} WHERE id = @id`).run({ ...datos, id });
}

function obtenerStatsHoy() {
  const hoy = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN estado = 'resuelto' THEN 1 ELSE 0 END) as resueltos,
      SUM(CASE WHEN estado = 'escalado' THEN 1 ELSE 0 END) as escalados,
      SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes
    FROM tickets
    WHERE DATE(fecha) = DATE('now')
  `).get();

  // Tiempo medio de respuesta en minutos (solo tickets resueltos con fecha_respuesta)
  const tiempoMedio = db.prepare(`
    SELECT AVG(
      (JULIANDAY(fecha_respuesta) - JULIANDAY(fecha)) * 24 * 60
    ) as minutos
    FROM tickets
    WHERE estado = 'resuelto'
      AND fecha_respuesta IS NOT NULL
      AND DATE(fecha) = DATE('now')
  `).get();

  return {
    ...hoy,
    tiempo_medio_respuesta: tiempoMedio?.minutos ? Math.round(tiempoMedio.minutos) : null
  };
}

// ---- QUERIES DE ACCIONES ----

function registrarAccion(ticketId, tipo, descripcion, datosExtra = null) {
  db.prepare(`
    INSERT INTO acciones (ticket_id, tipo, descripcion, datos_extra)
    VALUES (?, ?, ?, ?)
  `).run(ticketId, tipo, descripcion, datosExtra ? JSON.stringify(datosExtra) : null);
}

function obtenerAccionesDeTicket(ticketId) {
  return db.prepare('SELECT * FROM acciones WHERE ticket_id = ? ORDER BY fecha ASC').all(ticketId);
}

// ---- QUERIES DE CACHÉ SHEETS ----

function guardarEnCache(clave, valor) {
  db.prepare(`
    INSERT OR REPLACE INTO cache_sheets (clave, valor, ultima_sync)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `).run(clave, JSON.stringify(valor));
}

function obtenerDeCache(clave) {
  const row = db.prepare('SELECT * FROM cache_sheets WHERE clave = ?').get(clave);
  if (!row) return null;
  return {
    datos: JSON.parse(row.valor),
    ultima_sync: row.ultima_sync
  };
}

function obtenerTodaLaCache() {
  const rows = db.prepare('SELECT * FROM cache_sheets').all();
  const resultado = {};
  for (const row of rows) {
    resultado[row.clave] = {
      datos: JSON.parse(row.valor),
      ultima_sync: row.ultima_sync
    };
  }
  return resultado;
}

// ---- QUERIES DE CHAT ----

function guardarMensajeChat(rol, contenido) {
  db.prepare(`
    INSERT INTO chat_mensajes (rol, contenido)
    VALUES (?, ?)
  `).run(rol, contenido);
}

function obtenerHistorialChat(limite = 50) {
  return db.prepare(`
    SELECT * FROM chat_mensajes
    ORDER BY fecha DESC
    LIMIT ?
  `).all(limite).reverse();
}

module.exports = {
  inicializarDB,
  obtenerConfig,
  actualizarConfig,
  obtenerClientes,
  obtenerClientePorEmail,
  crearOActualizarCliente,
  obtenerTickets,
  obtenerTicketsDeHoy,
  obtenerTicketsDeCliente,
  crearTicket,
  actualizarTicket,
  obtenerStatsHoy,
  registrarAccion,
  obtenerAccionesDeTicket,
  guardarEnCache,
  obtenerDeCache,
  obtenerTodaLaCache,
  guardarMensajeChat,
  obtenerHistorialChat
};
