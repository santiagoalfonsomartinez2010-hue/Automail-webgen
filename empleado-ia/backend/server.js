// =============================================
// server.js - Servidor Express principal
// Puerto 3001
// =============================================

require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const multer = require('multer');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

const db = require('./database');
const agent = require('./agent');
const sheets = require('./sheets');
const gmail = require('./gmail');

// ---- CONFIGURACIÓN ----

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer para subida de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (permitidos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'));
  }
});

// ---- INICIALIZACIÓN ----

async function inicializar() {
  // 1. Base de datos
  db.inicializarDB();

  // 2. Google Sheets
  sheets.inicializarSheets();
  const config = db.obtenerConfig();
  if (config.onboarding_completado) {
    await sheets.sincronizarSheets(config.sheet_id);
  }

  // 3. Gmail
  gmail.inicializarOAuth2();

  // 4. Agente IA
  agent.inicializarAgente(io);

  // 5. Cron: sincronizar Sheets cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    const cfg = db.obtenerConfig();
    if (cfg.onboarding_completado && cfg.sheet_id) {
      await sheets.sincronizarSheets(cfg.sheet_id);
      io.emit('sheets:sincronizado', { fecha: new Date().toISOString() });
    }
  });

  // 6. Si el onboarding está completo, procesar emails al arrancar
  if (config.onboarding_completado) {
    setTimeout(() => {
      agent.procesarEmailsPendientes();
    }, 2000);
  }

  console.log(`\n🚀 Servidor iniciado en http://localhost:${PORT}`);
  console.log(`📊 Modo: ${process.env.MODO_SIMULACION === 'true' ? 'SIMULACIÓN' : 'PRODUCCIÓN'}\n`);
}

// ---- SOCKET.IO ----

io.on('connection', (socket) => {
  console.log('👤 Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('👤 Cliente desconectado:', socket.id);
  });
});

// ---- RUTAS API ----

// --- Configuración y onboarding ---

app.get('/api/config', (req, res) => {
  const config = db.obtenerConfig();
  res.json(config);
});

app.post('/api/config', (req, res) => {
  try {
    const config = db.actualizarConfig(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subir foto de la empleada
app.post('/api/config/foto', upload.single('foto'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });

  const fotoUrl = `/uploads/${req.file.filename}`;
  db.actualizarConfig({ foto_url: fotoUrl });
  res.json({ foto_url: fotoUrl });
});

// Verificar conexión con Google Sheets
app.post('/api/sheets/verificar', async (req, res) => {
  const { sheet_id } = req.body;
  if (!sheet_id) return res.status(400).json({ error: 'sheet_id requerido' });

  const resultado = await sheets.verificarConexionSheets(sheet_id);
  res.json(resultado);
});

// Sincronizar Google Sheets manualmente
app.post('/api/sheets/sincronizar', async (req, res) => {
  const config = db.obtenerConfig();
  const sheetId = req.body.sheet_id || config.sheet_id;

  if (!sheetId) return res.status(400).json({ error: 'No hay Sheet ID configurado' });

  const ok = await sheets.sincronizarSheets(sheetId);
  if (ok) {
    io.emit('sheets:sincronizado', { fecha: new Date().toISOString() });
    res.json({ ok: true, mensaje: 'Sincronización completada' });
  } else {
    res.status(500).json({ ok: false, error: 'Error en la sincronización' });
  }
});

// Completar onboarding
app.post('/api/onboarding/completar', async (req, res) => {
  try {
    db.actualizarConfig({ onboarding_completado: 1 });

    // Sincronizar sheets y procesar emails al completar el onboarding
    const config = db.obtenerConfig();
    if (config.sheet_id) {
      await sheets.sincronizarSheets(config.sheet_id);
    }

    setTimeout(() => agent.procesarEmailsPendientes(), 1000);

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Tickets ---

app.get('/api/tickets', (req, res) => {
  const { estado, fecha } = req.query;
  const tickets = db.obtenerTickets({ estado, fecha });
  res.json(tickets);
});

app.get('/api/tickets/hoy', (req, res) => {
  const tickets = db.obtenerTicketsDeHoy();
  res.json(tickets);
});

app.get('/api/tickets/:id/acciones', (req, res) => {
  const acciones = db.obtenerAccionesDeTicket(parseInt(req.params.id));
  res.json(acciones);
});

app.patch('/api/tickets/:id', (req, res) => {
  try {
    db.actualizarTicket(parseInt(req.params.id), req.body);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Clientes ---

app.get('/api/clientes', (req, res) => {
  const clientes = db.obtenerClientes();
  res.json(clientes);
});

app.get('/api/clientes/:email/tickets', (req, res) => {
  const cliente = db.obtenerClientePorEmail(req.params.email);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const tickets = db.obtenerTicketsDeCliente(cliente.id);
  res.json({ cliente, tickets });
});

// --- Estadísticas ---

app.get('/api/stats', (req, res) => {
  const stats = db.obtenerStatsHoy();
  res.json(stats);
});

// --- Base de conocimiento ---

app.get('/api/conocimiento', (req, res) => {
  const cache = db.obtenerTodaLaCache();
  res.json(cache);
});

// --- Chat con la empleada ---

app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje?.trim()) return res.status(400).json({ error: 'Mensaje requerido' });

  try {
    const respuesta = await agent.chatConEmpresario(mensaje);
    res.json({ respuesta, fecha: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chat/historial', (req, res) => {
  const historial = db.obtenerHistorialChat(50);
  res.json(historial);
});

// --- Procesar emails manualmente ---

app.post('/api/agente/procesar', async (req, res) => {
  try {
    // Inicia el procesamiento en background
    agent.procesarEmailsPendientes();
    res.json({ ok: true, mensaje: 'Procesamiento iniciado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Gmail OAuth2 ---

app.get('/api/gmail/url-autorizacion', (req, res) => {
  const url = gmail.generarUrlAutorizacion();
  if (!url) return res.status(400).json({ error: 'Gmail no configurado en .env' });
  res.json({ url });
});

app.get('/auth/gmail/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Código de autorización faltante');

  try {
    const tokens = await gmail.intercambiarCodigo(code);
    db.actualizarConfig({ gmail_conectado: 1 });
    io.emit('gmail:conectado');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?gmail=conectado`);
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?gmail=error`);
  }
});

app.get('/api/gmail/estado', (req, res) => {
  res.json({ conectado: gmail.estaConectado() });
});

// ---- MANEJO DE ERRORES ----

app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ---- ARRANCAR ----

server.listen(PORT, () => {
  inicializar();
});

module.exports = { app, io };
