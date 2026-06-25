// =============================================
// gmail.js - Integración Gmail API (FASE 2)
// Por ahora solo contiene el placeholder y la
// estructura OAuth2 para conectar en el siguiente paso
// =============================================

const { google } = require('googleapis');

let gmailClient = null;
let tokenAlmacenado = null;

// Inicializa el cliente OAuth2 de Gmail
function inicializarOAuth2() {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
    console.log('⚠️  Gmail no configurado. Usando datos simulados.');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI || 'http://localhost:3001/auth/gmail/callback'
  );

  if (process.env.GMAIL_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });
    gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
    console.log('✅ Gmail OAuth2 inicializado con refresh token');
  }

  return oauth2Client;
}

// Genera la URL de autorización OAuth2 (paso 1 del flujo)
function generarUrlAutorizacion() {
  const oauth2Client = inicializarOAuth2();
  if (!oauth2Client) return null;

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    prompt: 'consent'
  });
}

// Intercambia el código de autorización por tokens (paso 2 del flujo)
async function intercambiarCodigo(codigo) {
  const oauth2Client = inicializarOAuth2();
  if (!oauth2Client) throw new Error('OAuth2 no inicializado');

  const { tokens } = await oauth2Client.getToken(codigo);
  oauth2Client.setCredentials(tokens);
  tokenAlmacenado = tokens;
  gmailClient = google.gmail({ version: 'v1', auth: oauth2Client });
  return tokens;
}

// Lee emails no leídos del inbox
// FASE 2: Esto leerá emails reales de Gmail
async function leerEmailsNuevos() {
  if (!gmailClient) {
    console.log('📧 Gmail no conectado, usando simulador');
    return null; // El llamador usará el simulador
  }

  try {
    // Buscar emails no leídos en el inbox
    const response = await gmailClient.users.messages.list({
      userId: 'me',
      q: 'is:unread in:inbox',
      maxResults: 20
    });

    const mensajes = response.data.messages || [];
    const emails = [];

    for (const mensaje of mensajes) {
      const detalle = await gmailClient.users.messages.get({
        userId: 'me',
        id: mensaje.id,
        format: 'full'
      });

      const cabeceras = detalle.data.payload.headers;
      const de = cabeceras.find(h => h.name === 'From')?.value || '';
      const asunto = cabeceras.find(h => h.name === 'Subject')?.value || '';
      const fecha = cabeceras.find(h => h.name === 'Date')?.value || '';

      // Extraer cuerpo del email
      let cuerpo = '';
      const partes = detalle.data.payload.parts || [detalle.data.payload];
      for (const parte of partes) {
        if (parte.mimeType === 'text/plain' && parte.body?.data) {
          cuerpo = Buffer.from(parte.body.data, 'base64').toString('utf-8');
          break;
        }
      }

      emails.push({
        id: mensaje.id,
        de: extraerEmail(de),
        nombre_remitente: extraerNombre(de),
        asunto,
        cuerpo,
        fecha: new Date(fecha).toISOString()
      });
    }

    return emails;
  } catch (error) {
    console.error('❌ Error leyendo emails de Gmail:', error.message);
    return null;
  }
}

// Envía un email de respuesta
// FASE 2: Esto enviará emails reales
async function enviarRespuesta(destinatario, asunto, cuerpo, emailIdOriginal = null) {
  if (!gmailClient) {
    console.log(`📧 [SIMULADO] Enviando respuesta a ${destinatario}: ${asunto}`);
    return { id: 'sim_' + Date.now(), simulado: true };
  }

  try {
    const asuntoRespuesta = asunto.startsWith('Re:') ? asunto : `Re: ${asunto}`;

    const mensaje = [
      `To: ${destinatario}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${asuntoRespuesta}`,
      '',
      cuerpo
    ].join('\n');

    const mensajeCodificado = Buffer.from(mensaje)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const respuesta = await gmailClient.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: mensajeCodificado,
        threadId: emailIdOriginal // Para mantener el hilo
      }
    });

    // Marcar email original como leído
    if (emailIdOriginal && !emailIdOriginal.startsWith('sim_')) {
      await gmailClient.users.messages.modify({
        userId: 'me',
        id: emailIdOriginal,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
    }

    return { id: respuesta.data.id };
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    throw error;
  }
}

// Extrae el email de un campo From como "Nombre <email@ejemplo.com>"
function extraerEmail(campoFrom) {
  const match = campoFrom.match(/<(.+)>/);
  return match ? match[1] : campoFrom.trim();
}

// Extrae el nombre de un campo From
function extraerNombre(campoFrom) {
  const match = campoFrom.match(/^([^<]+)</);
  return match ? match[1].trim().replace(/"/g, '') : campoFrom.split('@')[0];
}

// Comprueba si Gmail está conectado
function estaConectado() {
  return gmailClient !== null;
}

module.exports = {
  inicializarOAuth2,
  generarUrlAutorizacion,
  intercambiarCodigo,
  leerEmailsNuevos,
  enviarRespuesta,
  estaConectado
};
