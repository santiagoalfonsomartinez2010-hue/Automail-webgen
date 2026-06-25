// =============================================
// mockData.js - Datos de demo para Ferreterías López
// Se usan cuando el backend no está disponible
// =============================================

const ahora = Date.now();
const hace = (min) => new Date(ahora - min * 60000).toISOString();

export const mockConfig = {
  id: 1,
  nombre_empleada: 'Sofía',
  empresa: 'Ferreterías López',
  tono: 'cercano',
  foto_url: null,
  sheet_id: 'demo',
  onboarding_completado: 1,
  gmail_conectado: 0
};

export const mockStats = {
  total: 8,
  resueltos: 7,
  escalados: 1,
  pendientes: 0,
  tiempo_medio_respuesta: 5
};

export const mockTickets = [
  {
    id: 2, cliente_id: 2, email_id: 'sim_002',
    asunto: 'URGENTE: Defecto en sierra circular comprada ayer',
    categoria: 'reclamacion', urgencia: 'critica', estado: 'escalado',
    email_original: 'Ayer compré una sierra circular Makita HS6601. Al usarla hoy la guía está torcida y corta en diagonal. Necesito solución HOY.',
    respuesta_enviada: null,
    notas_internas: 'Escalado: cliente muy enfadado, defecto grave en compra reciente. Requiere atención urgente del responsable de tienda.',
    confianza_ia: 45, fecha: hace(60), fecha_respuesta: null,
    cliente_nombre: 'Carlos Rodríguez Martín', cliente_email: 'carlos.rodriguez@hotmail.com', es_vip: 0
  },
  {
    id: 3, cliente_id: 3, email_id: 'sim_003',
    asunto: 'Pedido para obra - Presupuesto materiales',
    categoria: 'pedido', urgencia: 'alta', estado: 'resuelto',
    email_original: 'Necesitamos para el lunes: 50 brocas SDS+ 10mm, 20 discos corte 115mm piedra, 5 cintas Stanley 10m, 10 pares guantes L.',
    respuesta_enviada: 'Buenos días Lucía,\n\nAquí tienes el presupuesto con vuestro descuento del 12%:\n\n• 50 brocas SDS+ 10mm: 550€\n• 20 discos corte piedra 115mm: 56,32€\n• 5 cintas Stanley 10m: 83,16€\n• 10 pares guantes L: 78,76€\n\nTOTAL: 768,24€ (IVA incluido)\n\nEntrega garantizada el viernes.\n\nSofía — Ferreterías López',
    notas_internas: 'Cliente VIP. Descuento 12% aplicado. Entrega viernes confirmada.',
    confianza_ia: 98, fecha: hace(90), fecha_respuesta: hace(85),
    cliente_nombre: 'Lucía Fernández', cliente_email: 'lucia.fernandez.obra@empresa-construccion.es', es_vip: 1
  },
  {
    id: 1, cliente_id: 1, email_id: 'sim_001',
    asunto: 'Consulta sobre taladros percutores',
    categoria: 'consulta', urgencia: 'normal', estado: 'resuelto',
    email_original: 'Me gustaría saber si tienen el taladro Bosch GSB 18V-55. Mi presupuesto es de 150-180€. ¿Hacen envíos a Madrid?',
    respuesta_enviada: 'Hola María,\n\nSí tenemos el Bosch GSB 18V-55 por 159€. Incluye 2 baterías, cargador y maletín.\n\nEnvíos a Madrid: 4,95€, entrega en 24-48h.\n\nSofía — Ferreterías López',
    notas_internas: 'Producto en stock. Respondida con precio y condiciones de envío.',
    confianza_ia: 97, fecha: hace(120), fecha_respuesta: hace(112),
    cliente_nombre: 'María García López', cliente_email: 'maria.garcia.lopez@gmail.com', es_vip: 0
  },
  {
    id: 7, cliente_id: 7, email_id: 'sim_007',
    asunto: 'Reclamación: pedido online llegó incompleto',
    categoria: 'reclamacion', urgencia: 'alta', estado: 'resuelto',
    email_original: 'Pedido FER-2024-0892 llegó incompleto. Faltan 2 metros de cable eléctrico 2.5mm.',
    respuesta_enviada: 'Hola Elena,\n\nDisculpa las molestias. Vamos a enviarte el cable hoy mismo con envío urgente sin coste adicional. Lo recibirás mañana antes de las 14:00.\n\nSofía — Ferreterías López',
    notas_internas: 'Pedido incompleto verificado. Enviado reenvío urgente según política.',
    confianza_ia: 93, fecha: hace(70), fecha_respuesta: hace(66),
    cliente_nombre: 'Elena Vidal', cliente_email: 'elena.vidal.constructora@gmail.com', es_vip: 0
  },
  {
    id: 5, cliente_id: 5, email_id: 'sim_005',
    asunto: 'Devolución lijadora orbital - mal funcionamiento',
    categoria: 'garantia', urgencia: 'normal', estado: 'resuelto',
    email_original: 'Compré lijadora Black&Decker BDERO100 hace un mes. Hace ruido extraño y vibra más de lo normal.',
    respuesta_enviada: 'Hola Isabel,\n\nGestionamos la garantía sin problema. Trae la lijadora con el ticket original. Si confirmamos el defecto la sustituimos o reparamos gratis.\n\nSofía — Ferreterías López',
    notas_internas: 'Garantía válida (menos de 10h de uso). Indicado el procedimiento.',
    confianza_ia: 95, fecha: hace(150), fecha_respuesta: hace(144),
    cliente_nombre: 'Isabel Castro', cliente_email: 'isabel.castro.reformas@gmail.com', es_vip: 0
  },
  {
    id: 4, cliente_id: 4, email_id: 'sim_004',
    asunto: '¿Aceptan tarjeta Mastercard?',
    categoria: 'consulta', urgencia: 'baja', estado: 'resuelto',
    email_original: '¿En vuestra tienda aceptan tarjeta Mastercard o solo efectivo?',
    respuesta_enviada: 'Hola Antonio,\n\n¡Claro! Aceptamos Visa, Mastercard, Amex, débito, efectivo y Bizum. Para compras +300€ tenemos financiación a 0%.\n\nSofía — Ferreterías López',
    notas_internas: 'Consulta de pago respondida con info completa.',
    confianza_ia: 99, fecha: hace(30), fecha_respuesta: hace(28),
    cliente_nombre: 'Antonio Moreno Sánchez', cliente_email: 'antonio.moreno@gmail.com', es_vip: 0
  },
  {
    id: 6, cliente_id: 6, email_id: 'sim_006',
    asunto: 'Horario de la tienda el domingo',
    categoria: 'consulta', urgencia: 'baja', estado: 'resuelto',
    email_original: '¿Abren el domingo?',
    respuesta_enviada: 'Hola Pedro,\n\nLos domingos estamos cerrados. Horario: L-V 9-14h y 16-20h, Sábados 9-14h.\n\nSofía — Ferreterías López',
    notas_internas: 'Consulta de horario. Respondida.',
    confianza_ia: 100, fecha: hace(10), fecha_respuesta: hace(9),
    cliente_nombre: 'Pedro Alonso Martín', cliente_email: 'pedro.alonso.martin@outlook.com', es_vip: 0
  },
  {
    id: 8, cliente_id: 8, email_id: 'sim_008',
    asunto: 'Consulta sobre alquiler de andamios',
    categoria: 'consulta', urgencia: 'normal', estado: 'resuelto',
    email_original: '¿Alquilan andamios? Necesito para fachada 20m2 a 6m altura.',
    respuesta_enviada: 'Hola Manuel,\n\n¡Sí alquilamos! Para tu caso: 2-3 tramos a 15€/día cada uno, unos 30-45€/día. Fianza reembolsable del 50%. Mín 1 día, máx 30 días.\n\nPasa por la tienda para calcular exactamente.\n\nSofía — Ferreterías López',
    notas_internas: 'Consulta de alquiler de andamios. Info de precios proporcionada.',
    confianza_ia: 91, fecha: hace(180), fecha_respuesta: hace(173),
    cliente_nombre: 'Manuel García', cliente_email: 'manuel.garcia.contratista@gmail.com', es_vip: 0
  }
];

export const mockClientes = [
  { id: 1, nombre: 'María García López', email: 'maria.garcia.lopez@gmail.com', telefono: null, empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(120), ultima_consulta: hace(120) },
  { id: 2, nombre: 'Carlos Rodríguez Martín', email: 'carlos.rodriguez@hotmail.com', telefono: '645 32 18 90', empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(60), ultima_consulta: hace(60) },
  { id: 3, nombre: 'Lucía Fernández', email: 'lucia.fernandez.obra@empresa-construccion.es', telefono: null, empresa: 'Construcciones Fernández S.L.', es_vip: 1, instrucciones_vip: 'Descuento fijo 12%. Pago a 30 días aprobado. Prioridad ALTA.', total_tickets: 1, primera_consulta: hace(90), ultima_consulta: hace(90) },
  { id: 4, nombre: 'Antonio Moreno Sánchez', email: 'antonio.moreno@gmail.com', telefono: null, empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(30), ultima_consulta: hace(30) },
  { id: 5, nombre: 'Isabel Castro', email: 'isabel.castro.reformas@gmail.com', telefono: null, empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(150), ultima_consulta: hace(150) },
  { id: 6, nombre: 'Pedro Alonso Martín', email: 'pedro.alonso.martin@outlook.com', telefono: null, empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(10), ultima_consulta: hace(10) },
  { id: 7, nombre: 'Elena Vidal', email: 'elena.vidal.constructora@gmail.com', telefono: null, empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(70), ultima_consulta: hace(70) },
  { id: 8, nombre: 'Manuel García', email: 'manuel.garcia.contratista@gmail.com', telefono: null, empresa: null, es_vip: 0, total_tickets: 1, primera_consulta: hace(180), ultima_consulta: hace(180) }
];

export const mockConocimiento = {
  FAQs: {
    datos: [
      { Pregunta: '¿Cuál es el horario de la tienda?', Respuesta: 'Lunes a Viernes: 9:00-14:00 y 16:00-20:00. Sábados: 9:00-14:00. Domingos: CERRADO.', Categoría: 'horarios' },
      { Pregunta: '¿Hacen envíos a domicilio?', Respuesta: 'Sí, a toda España peninsular. Gratis a partir de 50€, sino 4,95€. Entrega en 24-48h laborables.', Categoría: 'envíos' },
      { Pregunta: '¿Qué métodos de pago aceptan?', Respuesta: 'Efectivo, Visa, Mastercard, American Express, débito, Bizum y financiación a 0% para compras superiores a 300€.', Categoría: 'pagos' },
      { Pregunta: '¿Tienen factura para empresas?', Respuesta: 'Sí, con CIF/NIF y dirección fiscal. Descuentos del 5-15% para empresas habituales.', Categoría: 'empresas' },
      { Pregunta: '¿Alquilan herramientas?', Respuesta: 'Sí: andamios (15€/día), hormigonera (25€/día), cortadora pavimento (35€/día), compresor (20€/día).', Categoría: 'alquiler' },
      { Pregunta: '¿Tienen aparcamiento?', Respuesta: 'Zona de carga/descarga frente a la tienda. Parking público a 200m en Calle Mayor 45.', Categoría: 'ubicación' }
    ],
    ultima_sync: new Date().toISOString()
  },
  Productos: {
    datos: [
      { Nombre: 'Taladro percutor Bosch GSB 18V-55', Precio: '159,00€', Descripción: 'Inalámbrico 18V, 55 Nm. Incluye 2 baterías 2Ah, cargador y maletín.' },
      { Nombre: 'Sierra circular Makita HS6601', Precio: '189,00€', Descripción: '1.010W, disco 165mm. Guía de corte paralelo incluida.' },
      { Nombre: 'Lijadora orbital Black&Decker BDERO100', Precio: '45,00€', Descripción: '450W, plato 125mm. Bolsa recogida de polvo. Garantía 2 años.' },
      { Nombre: 'Amoladora Dewalt DWE4120', Precio: '89,00€', Descripción: '720W, disco 115mm. Protección contra sobrecarga.' },
      { Nombre: 'Brocas SDS+ hormigón 10mm (pack 5)', Precio: '12,50€', Descripción: 'Punta carburo de tungsteno. Compatibles con Bosch, Makita, DeWalt.' },
      { Nombre: 'Cinta métrica Stanley FatMax 10m', Precio: '18,90€', Descripción: 'Bloqueo automático, carcasa antichoque, gancho magnético.' },
      { Nombre: 'Guantes de trabajo talla L (par)', Precio: '8,95€', Descripción: 'Palma cuero reforzado, dorso transpirable.' },
      { Nombre: 'Disco de corte piedra 115mm', Precio: '3,20€', Descripción: 'Para amoladora. Especial piedra, terrazo y cerámica.' }
    ],
    ultima_sync: new Date().toISOString()
  },
  Políticas: {
    datos: [
      { Tema: 'Devoluciones', Descripción: 'Primeros 15 días si el producto está sin usar y en embalaje original. Para defectos, el plazo es la garantía del fabricante (mínimo 2 años). Reembolso en 3-5 días laborables.' },
      { Tema: 'Garantía', Descripción: 'Garantía legal de 2 años en todos los productos. Gestionamos el servicio técnico con el fabricante. En defecto probado: sustitución o reparación sin coste.' },
      { Tema: 'Pedidos incompletos', Descripción: 'Comunicar en las primeras 48h. Enviamos el material faltante con envío urgente sin coste, o abonamos el importe en 24-48h.' },
      { Tema: 'Envíos', Descripción: 'MRW y SEUR. Entrega en 24h para pedidos antes de las 14:00h. 48h para el resto. Solo Península.' },
      { Tema: 'Precios empresa', Descripción: '5% en compras +100€, 10% en +500€, 15% en +1.000€. Pago a 30 días para empresas con cuenta abierta.' },
      { Tema: 'Alquiler de herramientas', Descripción: 'Andamios 15€/día, hormigonera 25€/día, cortadora 35€/día, compresor 20€/día. Fianza 50% del valor. Mín 1 día, máx 30 días.' }
    ],
    ultima_sync: new Date().toISOString()
  },
  Clientes_VIP: {
    datos: [
      { Email: 'lucia.fernandez.obra@empresa-construccion.es', Nombre: 'Lucía Fernández — Construcciones Fernández S.L.', Instrucciones_especiales: 'Descuento fijo 12%. Pago a 30 días aprobado. Puede hacer pedidos sin validación previa hasta 2.000€. Prioridad ALTA.' }
    ],
    ultima_sync: new Date().toISOString()
  }
};

export const mockAcciones = {
  2: [
    { id: 1, ticket_id: 2, tipo: 'analisis_ia', descripcion: 'Email analizado por Sofía con IA (confianza: 45%)', fecha: hace(60) },
    { id: 2, ticket_id: 2, tipo: 'escalado', descripcion: 'Escalado al responsable: cliente enfadado, defecto grave en compra reciente', fecha: hace(59) }
  ],
  3: [
    { id: 3, ticket_id: 3, tipo: 'analisis_ia', descripcion: 'Email analizado por Sofía con IA (confianza: 98%)', fecha: hace(90) },
    { id: 4, ticket_id: 3, tipo: 'respuesta_enviada', descripcion: 'Presupuesto enviado con descuento VIP del 12%', fecha: hace(85) }
  ]
};

export const mockChat = [
  { id: 1, rol: 'empleada', contenido: '¡Hola! Soy Sofía, tu empleada de atención al cliente 👋\n\nHoy he procesado 8 emails de clientes. He respondido 7 directamente y he escalado 1 caso urgente (Carlos Rodríguez, defecto en sierra circular) para que lo atiendas tú.\n\n¿En qué te puedo ayudar?', fecha: hace(5) }
];

const demoReplies = [
  'En el dashboard de hoy tienes 8 tickets procesados: 7 resueltos y 1 escalado. El ticket escalado es de Carlos Rodríguez por un defecto en su sierra circular, te recomiendo atenderlo hoy.',
  'He gestionado todos los emails de hoy con una confianza media del 95%. El caso más difícil fue el de Carlos con la sierra circular defectuosa — lo escalé porque necesitaba inspección física.',
  'Lucía Fernández es nuestra cliente VIP de Construcciones Fernández S.L. Le aplico siempre el 12% de descuento y tiene pago a 30 días aprobado. Hoy me hizo un pedido grande para el lunes.',
  'Mis categorías de hoy: 3 consultas, 2 reclamaciones, 1 pedido, 1 garantía y 1 consulta de horario. Los tiempos de respuesta están en media de 5 minutos.',
  'El ticket de garantía de Isabel Castro por la lijadora orbital está resuelto. Le expliqué el procedimiento: puede traer el producto con el ticket de compra y lo gestionamos sin coste.',
  'Estoy aquí para ayudarte con cualquier duda sobre los tickets o clientes de hoy. También puedo explicarte las políticas de la tienda o ayudarte a preparar respuestas.',
];

let demoReplyIndex = 0;
export function mockDemoReply(mensaje) {
  const lower = mensaje.toLowerCase();
  if (lower.includes('escalado') || lower.includes('carlos') || lower.includes('sierra')) {
    return 'El ticket escalado es de Carlos Rodríguez (carlos.rodriguez@hotmail.com). Compró una sierra circular Makita HS6601 y al usarla la guía está torcida. Necesita atención urgente del responsable de tienda — recomiendo llamarle hoy.';
  }
  if (lower.includes('lucía') || lower.includes('lucia') || lower.includes('vip')) {
    return 'Lucía Fernández es VIP de Construcciones Fernández S.L. Le aplico siempre el 12% de descuento y tiene pago a 30 días. Hoy me hizo un pedido de materiales para obra — le envié presupuesto de 768,24€ con entrega el viernes.';
  }
  if (lower.includes('ticket') || lower.includes('hoy') || lower.includes('resumen')) {
    return 'Hoy he procesado 8 emails. 7 resueltos directamente (consultas de productos, garantías, devoluciones, horarios) y 1 escalado (defecto grave en herramienta). Tiempo medio de respuesta: 5 minutos.';
  }
  const reply = demoReplies[demoReplyIndex % demoReplies.length];
  demoReplyIndex++;
  return reply;
}
