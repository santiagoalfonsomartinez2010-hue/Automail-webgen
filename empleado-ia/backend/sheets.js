// =============================================
// sheets.js - Integración con Google Sheets API v4
// Sincroniza FAQs, Productos, Políticas y Clientes VIP
// =============================================

const { google } = require('googleapis');
const db = require('./database');
const { obtenerDatosSheets } = require('./simulator');

// Instancia de la API de Sheets
let sheetsClient = null;

// Inicializa el cliente de Google Sheets con Service Account
function inicializarSheets() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.log('⚠️  Credenciales de Google Sheets no configuradas, usando datos simulados');
      return null;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    console.log('✅ Cliente de Google Sheets inicializado');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Error inicializando Google Sheets:', error.message);
    return null;
  }
}

// Obtiene los datos de una pestaña específica del Sheet
async function leerPestania(sheetId, nombrePestania) {
  try {
    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${nombrePestania}!A1:Z1000`
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    // Primera fila son las cabeceras
    const cabeceras = rows[0];
    return rows.slice(1).map(fila => {
      const objeto = {};
      cabeceras.forEach((cabecera, i) => {
        objeto[cabecera] = fila[i] || '';
      });
      return objeto;
    });
  } catch (error) {
    console.error(`❌ Error leyendo pestaña ${nombrePestania}:`, error.message);
    return [];
  }
}

// Verifica que el Sheet es accesible y tiene las pestañas correctas
async function verificarConexionSheets(sheetId) {
  try {
    if (process.env.MODO_SIMULACION === 'true' || !sheetsClient) {
      // En modo simulación, simular verificación exitosa
      await new Promise(r => setTimeout(r, 800)); // Simular latencia
      return {
        ok: true,
        pestanas: ['FAQs', 'Productos', 'Políticas', 'Clientes_VIP'],
        simulado: true
      };
    }

    const response = await sheetsClient.spreadsheets.get({
      spreadsheetId: sheetId
    });

    const pestanas = response.data.sheets.map(s => s.properties.title);
    const requeridas = ['FAQs', 'Productos', 'Políticas', 'Clientes_VIP'];
    const faltantes = requeridas.filter(p => !pestanas.includes(p));

    return {
      ok: faltantes.length === 0,
      pestanas,
      faltantes,
      titulo: response.data.properties.title
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

// Sincroniza todos los datos del Sheet a la caché SQLite
async function sincronizarSheets(sheetId) {
  const inicio = Date.now();
  console.log('🔄 Iniciando sincronización de Google Sheets...');

  let datos;

  if (process.env.MODO_SIMULACION === 'true' || !sheetsClient) {
    // Usar datos simulados
    datos = obtenerDatosSheets();
    console.log('📊 Usando datos simulados de Ferreterías López');
  } else {
    // Leer del Sheet real
    try {
      const [faqs, productos, politicas, clientesVip] = await Promise.all([
        leerPestania(sheetId, 'FAQs'),
        leerPestania(sheetId, 'Productos'),
        leerPestania(sheetId, 'Políticas'),
        leerPestania(sheetId, 'Clientes_VIP')
      ]);
      datos = { FAQs: faqs, Productos: productos, Políticas: politicas, Clientes_VIP: clientesVip };
    } catch (error) {
      console.error('❌ Error leyendo Sheet, usando caché existente:', error.message);
      return false;
    }
  }

  // Guardar en caché SQLite
  db.guardarEnCache('FAQs', datos.FAQs);
  db.guardarEnCache('Productos', datos.Productos);
  db.guardarEnCache('Políticas', datos.Políticas || datos['Políticas']);
  db.guardarEnCache('Clientes_VIP', datos.Clientes_VIP);

  // Sincronizar clientes VIP a la tabla de clientes
  const clientesVip = datos.Clientes_VIP || [];
  for (const vip of clientesVip) {
    if (vip.Email) {
      const existente = db.obtenerClientePorEmail(vip.Email);
      if (!existente) {
        db.crearOActualizarCliente({
          nombre: vip.Nombre,
          email: vip.Email,
          instrucciones_vip: vip.Instrucciones_especiales,
          es_vip: 1
        });
      }
    }
  }

  const duracion = Date.now() - inicio;
  console.log(`✅ Sincronización completada en ${duracion}ms - FAQs: ${datos.FAQs?.length || 0}, Productos: ${datos.Productos?.length || 0}`);
  return true;
}

// Obtiene el contexto relevante del conocimiento para un email
function obtenerContextoRelevante(emailTexto) {
  const cache = db.obtenerTodaLaCache();

  return {
    faqs: cache.FAQs?.datos || [],
    productos: cache.Productos?.datos || [],
    politicas: cache.Políticas?.datos || [],
    clientesVip: cache.Clientes_VIP?.datos || [],
    ultima_sync: cache.FAQs?.ultima_sync || null
  };
}

module.exports = {
  inicializarSheets,
  verificarConexionSheets,
  sincronizarSheets,
  obtenerContextoRelevante
};
