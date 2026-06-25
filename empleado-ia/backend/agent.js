// =============================================
// agent.js - El cerebro del Empleado IA
// Usa Claude para razonar sobre cada email y decidir
// =============================================

const Anthropic = require('@anthropic-ai/sdk');
const db = require('./database');
const gmail = require('./gmail');
const sheets = require('./sheets');
const { obtenerEmailsNuevos } = require('./simulator');

let anthropicClient = null;
let ioInstance = null; // Socket.io para notificaciones en tiempo real
let procesando = false;

function inicializarAgente(io) {
  ioInstance = io;

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY no configurada');
    return false;
  }

  anthropicClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  console.log('✅ Agente IA inicializado con Claude');
  return true;
}

// Emite evento a todos los clientes conectados via Socket.io
function emitirEvento(evento, datos) {
  if (ioInstance) {
    ioInstance.emit(evento, datos);
  }
}

// ---- LOOP PRINCIPAL DEL AGENTE ----

async function procesarEmailsPendientes() {
  if (procesando) {
    console.log('⏳ El agente ya está procesando emails, saltando ciclo');
    return;
  }

  procesando = true;
  emitirEvento('agente:inicio', { mensaje: 'Revisando emails nuevos...' });

  try {
    // 1. Obtener emails (Gmail real o simulados)
    let emails = null;
    if (gmail.estaConectado()) {
      emails = await gmail.leerEmailsNuevos();
    }

    // Si Gmail no está conectado o devuelve null, usar simulador
    if (!emails) {
      emails = obtenerEmailsNuevos();
    }

    // Filtrar emails ya procesados (que ya tenemos en la BD)
    const emailsFiltrados = emails.filter(email => {
      const ticketExistente = db.obtenerTickets({ email_id: email.id });
      return !ticketExistente || ticketExistente.length === 0;
    });

    if (emailsFiltrados.length === 0) {
      console.log('📭 No hay emails nuevos para procesar');
      emitirEvento('agente:fin', { mensaje: 'Sin emails nuevos', procesados: 0 });
      return;
    }

    console.log(`📧 Procesando ${emailsFiltrados.length} emails nuevos`);
    emitirEvento('agente:progreso', { mensaje: `Encontré ${emailsFiltrados.length} emails nuevos`, total: emailsFiltrados.length });

    // 2. Procesar cada email
    for (let i = 0; i < emailsFiltrados.length; i++) {
      const email = emailsFiltrados[i];
      emitirEvento('agente:progreso', {
        mensaje: `Analizando: "${email.asunto}"`,
        actual: i + 1,
        total: emailsFiltrados.length
      });

      await procesarUnEmail(email);

      // Pequeña pausa para no saturar la API
      await new Promise(r => setTimeout(r, 500));
    }

    emitirEvento('agente:fin', {
      mensaje: `Procesé ${emailsFiltrados.length} emails correctamente`,
      procesados: emailsFiltrados.length
    });

  } catch (error) {
    console.error('❌ Error en el loop del agente:', error);
    emitirEvento('agente:error', { mensaje: 'Error procesando emails: ' + error.message });
  } finally {
    procesando = false;
  }
}

// Procesa un email individual con el razonamiento de Claude
async function procesarUnEmail(email) {
  console.log(`\n📨 Procesando: ${email.asunto} (de: ${email.de})`);

  // a. Buscar o crear cliente
  const cliente = db.crearOActualizarCliente({
    nombre: email.nombre_remitente,
    email: email.de,
    telefono: null,
    empresa: null
  });

  // b. Cargar historial del cliente
  const historialTickets = db.obtenerTicketsDeCliente(cliente.id);

  // c. Cargar contexto de conocimiento
  const conocimiento = sheets.obtenerContextoRelevante(email.cuerpo + ' ' + email.asunto);

  // d. Cargar configuración del empleado
  const config = db.obtenerConfig();

  // e. Verificar si es cliente VIP
  const clienteVip = conocimiento.clientesVip.find(
    v => v.Email?.toLowerCase() === email.de.toLowerCase()
  );

  // f. Enviar todo a Claude para que razone
  const decision = await consultarClaude({
    email,
    cliente,
    historialTickets,
    conocimiento,
    config,
    clienteVip
  });

  if (!decision) {
    console.error('❌ Claude no pudo tomar una decisión para:', email.asunto);
    return;
  }

  // g. Crear ticket en la BD
  const ticket = db.crearTicket({
    cliente_id: cliente.id,
    email_id: email.id,
    asunto: email.asunto,
    categoria: decision.categoria,
    urgencia: clienteVip ? 'alta' : decision.urgencia,
    estado: decision.decision === 'responder' ? 'resuelto' : 'escalado',
    email_original: email.cuerpo,
    respuesta_enviada: decision.decision === 'responder' ? decision.respuesta : null,
    notas_internas: decision.notas_internas,
    confianza_ia: decision.confianza
  });

  // h. Actualizar fecha de respuesta si se respondió
  if (decision.decision === 'responder') {
    db.actualizarTicket(ticket.id, { fecha_respuesta: new Date().toISOString() });
  }

  // i. Registrar acción
  db.registrarAccion(ticket.id, 'analisis_ia', `Claude analizó el email con ${decision.confianza}% de confianza`, {
    decision: decision.decision,
    razonamiento: decision.notas_internas
  });

  // j. Enviar respuesta por email (Gmail real o simulado)
  if (decision.decision === 'responder' && decision.respuesta) {
    await gmail.enviarRespuesta(email.de, email.asunto, decision.respuesta, email.id);
    db.registrarAccion(ticket.id, 'respuesta_enviada', `Respuesta enviada a ${email.de}`);
    console.log(`✅ Respuesta enviada a ${email.de}`);
  } else {
    db.registrarAccion(ticket.id, 'escalado', `Escalado: ${decision.motivo_escalado}`);
    console.log(`⚠️  Ticket escalado: ${decision.motivo_escalado}`);
  }

  // k. Notificar en tiempo real
  emitirEvento('ticket:nuevo', {
    ticket: {
      ...ticket,
      cliente_nombre: cliente.nombre,
      cliente_email: cliente.email,
      es_vip: clienteVip ? 1 : 0
    },
    decision: decision.decision,
    mensaje: decision.decision === 'responder'
      ? `✅ Respondí a ${cliente.nombre}: "${email.asunto}"`
      : `⚠️ Escalé el ticket de ${cliente.nombre}: ${decision.motivo_escalado}`
  });
}

// ---- LLAMADA A CLAUDE API ----

async function consultarClaude({ email, cliente, historialTickets, conocimiento, config, clienteVip }) {
  if (!anthropicClient) {
    console.error('❌ Cliente de Anthropic no inicializado');
    return null;
  }

  // Construir el historial de tickets del cliente de forma legible
  const historialTexto = historialTickets.length > 0
    ? historialTickets.map(t =>
        `- ${t.fecha}: ${t.asunto} (${t.categoria}, ${t.estado})`
      ).join('\n')
    : 'Sin historial previo';

  // Construir el contexto de conocimiento
  const faqsTexto = conocimiento.faqs
    .map(f => `P: ${f.Pregunta}\nR: ${f.Respuesta}`)
    .join('\n\n');

  const productosTexto = conocimiento.productos
    .map(p => `- ${p.Nombre}: ${p.Precio} | ${p.Descripción}`)
    .join('\n');

  const politicasTexto = conocimiento.politicas
    .map(p => `${p.Tema}: ${p.Descripción}`)
    .join('\n\n');

  // Reglas de escalado desde config
  const reglasEscalado = config.reglas_escalado
    ? JSON.parse(config.reglas_escalado)
    : { importeMaximo: 200, categorias: ['legal', 'fraude'], palabrasClave: ['abogado', 'denuncia'] };

  const prompt = `Eres ${config.nombre_empleada || 'Sofía'}, la empleada de atención al cliente de ${config.empresa || 'la empresa'}.
Tu tono de comunicación es: ${config.tono || 'profesional y cercano'}.

CONOCIMIENTO DE LA EMPRESA:
=== FAQs ===
${faqsTexto}

=== CATÁLOGO DE PRODUCTOS ===
${productosTexto}

=== POLÍTICAS ===
${politicasTexto}

INFORMACIÓN DEL CLIENTE:
- Nombre: ${cliente.nombre}
- Email: ${cliente.email}
- Es cliente VIP: ${clienteVip ? 'SÍ' : 'NO'}
${clienteVip ? `- Instrucciones especiales VIP: ${clienteVip.Instrucciones_especiales}` : ''}
- Total tickets previos: ${cliente.total_tickets || 0}

HISTORIAL DE TICKETS DEL CLIENTE:
${historialTexto}

REGLAS DE ESCALADO (cuándo NO responder y escalar al humano):
- Escalar si el importe del problema supera ${reglasEscalado.importeMaximo}€
- Escalar si la categoría es: ${reglasEscalado.categorias?.join(', ')}
- Escalar si aparecen estas palabras clave: ${reglasEscalado.palabrasClave?.join(', ')}
- Escalar si el cliente está claramente enfadado y en su 2ª queja del mismo problema
- Escalar si necesitas información que no tienes en el contexto

EMAIL RECIBIDO:
Asunto: ${email.asunto}
De: ${email.nombre_remitente} <${email.de}>
Fecha: ${email.fecha}
Cuerpo:
${email.cuerpo}

INSTRUCCIONES:
1. Analiza el email con detenimiento
2. Decide si puedes responder con la información disponible o debes escalar
3. Si respondes, sé ${config.tono === 'formal' ? 'formal y profesional' : config.tono === 'cercano' ? 'cercano y amigable' : 'profesional pero cercano'}
4. La respuesta debe ser completa y resolver la duda del cliente
5. Firma siempre como "${config.nombre_empleada || 'Sofía'}, Atención al Cliente de ${config.empresa || 'la empresa'}"

Responde ÚNICAMENTE con un objeto JSON válido con este formato exacto:
{
  "decision": "responder" | "escalar",
  "categoria": "consulta" | "reclamacion" | "pedido" | "devolucion" | "garantia" | "otro",
  "urgencia": "baja" | "normal" | "alta" | "critica",
  "respuesta": "texto completo de la respuesta al cliente (solo si decision es responder)",
  "motivo_escalado": "explicación breve de por qué escalar (solo si decision es escalar)",
  "notas_internas": "notas para el empresario sobre este ticket",
  "confianza": numero entre 0 y 100
}`;

  try {
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const respuestaTexto = message.content[0].text.trim();

    // Extraer JSON de la respuesta (puede venir con texto alrededor)
    const jsonMatch = respuestaTexto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Claude no devolvió JSON válido:', respuestaTexto.substring(0, 200));
      return null;
    }

    const decision = JSON.parse(jsonMatch[0]);
    console.log(`🤖 Claude decidió: ${decision.decision} (confianza: ${decision.confianza}%)`);
    return decision;

  } catch (error) {
    console.error('❌ Error llamando a Claude:', error.message);
    return null;
  }
}

// ---- CHAT CON EL EMPRESARIO ----

async function chatConEmpresario(mensajeUsuario) {
  if (!anthropicClient) {
    return 'Lo siento, el servicio de IA no está disponible en este momento. Por favor, configura tu clave de Anthropic API.';
  }

  const config = db.obtenerConfig();
  const stats = db.obtenerStatsHoy();
  const ticketsRecientes = db.obtenerTicketsDeHoy().slice(0, 5);
  const historialChat = db.obtenerHistorialChat(20);

  // Guardar mensaje del usuario
  db.guardarMensajeChat('usuario', mensajeUsuario);

  // Construir contexto del chat
  const mensajesHistorial = historialChat.map(m => ({
    role: m.rol === 'usuario' ? 'user' : 'assistant',
    content: m.contenido
  }));

  // Añadir el mensaje actual
  mensajesHistorial.push({
    role: 'user',
    content: mensajeUsuario
  });

  const sistemPrompt = `Eres ${config.nombre_empleada || 'Sofía'}, la empleada de IA de atención al cliente de ${config.empresa || 'la empresa'}.
Estás hablando con tu jefe, el empresario que te ha contratado.

MI ACTIVIDAD DE HOY:
- Total tickets procesados: ${stats.total || 0}
- Resueltos por mí: ${stats.resueltos || 0}
- Escalados a ti: ${stats.escalados || 0}
- Pendientes: ${stats.pendientes || 0}
- Tiempo medio de respuesta: ${stats.tiempo_medio_respuesta ? stats.tiempo_medio_respuesta + ' minutos' : 'no disponible'}

ÚLTIMOS TICKETS QUE HE GESTIONADO:
${ticketsRecientes.map(t => `- ${t.cliente_nombre || 'Cliente'}: "${t.asunto}" → ${t.estado}`).join('\n') || 'Sin tickets hoy aún'}

INSTRUCCIONES DE COMPORTAMIENTO:
- Habla como una empleada real, con personalidad propia
- Sé proactiva e informa sobre lo que has estado haciendo
- Si el empresario te da instrucciones nuevas, dile que las tendrás en cuenta
- Si te pregunta algo sobre un ticket, busca en tu contexto y responde con detalle
- Puedes sugerir mejoras al empresario basadas en lo que ves
- Tono: profesional pero cercano, como una colega de confianza
- Si te preguntan qué instrucciones puedes recibir, explica que puedes cambiar el tono, añadir reglas de escalado, etc.`;

  try {
    const message = await anthropicClient.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: sistemPrompt,
      messages: mensajesHistorial
    });

    const respuesta = message.content[0].text;

    // Guardar respuesta en historial
    db.guardarMensajeChat('empleada', respuesta);

    return respuesta;
  } catch (error) {
    console.error('❌ Error en chat con Claude:', error.message);
    const respuestaError = 'Disculpa, tuve un problema técnico. ¿Puedes repetir tu mensaje?';
    db.guardarMensajeChat('empleada', respuestaError);
    return respuestaError;
  }
}

module.exports = {
  inicializarAgente,
  procesarEmailsPendientes,
  chatConEmpresario
};
