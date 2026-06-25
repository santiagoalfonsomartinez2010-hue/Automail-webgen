// =============================================
// simulator.js - Datos simulados para desarrollo
// Ferretería López - una ferretería española ficticia
// =============================================

// Emails simulados que llegan hoy
const EMAILS_SIMULADOS = [
  {
    id: 'sim_001',
    de: 'maria.garcia.lopez@gmail.com',
    nombre_remitente: 'María García López',
    asunto: 'Consulta sobre taladros percutores',
    cuerpo: `Buenas tardes,

Me pongo en contacto con ustedes para preguntar por el taladro percutor Bosch GSB 18V-55.
Vi en su web que lo tenían, pero no encuentro si está disponible actualmente.

Mi presupuesto es de unos 150-180€. ¿Tienen algo similar en ese rango?
¿Hacen envíos a domicilio en Madrid? ¿Cuánto tarda?

Muchas gracias de antemano.
Un saludo,
María García`,
    fecha: new Date(Date.now() - 7200000).toISOString() // 2h antes
  },
  {
    id: 'sim_002',
    de: 'carlos.rodriguez@hotmail.com',
    nombre_remitente: 'Carlos Rodríguez Martín',
    asunto: 'URGENTE: Defecto en sierra circular comprada ayer',
    cuerpo: `Hola,

Ayer compré una sierra circular Makita HS6601 en vuestra tienda (ticket de compra adjunto).
Al usarla esta mañana he visto que la guía está torcida y corta en diagonal.

Esto es completamente inaceptable. Necesito una solución HOY porque tengo una obra mañana
y la herramienta me es imprescindible.

¿Pueden cambiarla en el día o me devuelven el dinero?

Carlos Rodríguez
Teléfono: 645 32 18 90`,
    fecha: new Date(Date.now() - 3600000).toISOString() // 1h antes
  },
  {
    id: 'sim_003',
    de: 'lucia.fernandez.obra@empresa-construccion.es',
    nombre_remitente: 'Lucía Fernández',
    asunto: 'Pedido para obra - Presupuesto materiales',
    cuerpo: `Buenos días,

Soy jefa de compras de Construcciones Fernández S.L.
Necesitamos hacer un pedido para una obra que empieza el lunes:

- 50 brocas de hormigón SDS+ 10mm
- 20 discos de corte para radial (115mm piedra)
- 5 cintas métricas de 10m Stanley
- 10 pares de guantes de trabajo talla L

¿Pueden enviarnos presupuesto con precio para empresa? Somos clientes habituales.
Necesitamos la entrega para el viernes como muy tarde.

Gracias,
Lucía Fernández
Dpto. Compras - Construcciones Fernández S.L.`,
    fecha: new Date(Date.now() - 5400000).toISOString() // 1.5h antes
  },
  {
    id: 'sim_004',
    de: 'antonio.moreno@gmail.com',
    nombre_remitente: 'Antonio Moreno Sánchez',
    asunto: '¿Aceptan tarjeta Mastercard?',
    cuerpo: `Hola, quería saber si en vuestra tienda aceptan pago con tarjeta Mastercard
o solo efectivo. Quiero ir a comprar una amoladora este fin de semana.

Gracias`,
    fecha: new Date(Date.now() - 1800000).toISOString() // 30 min antes
  },
  {
    id: 'sim_005',
    de: 'isabel.castro.reformas@gmail.com',
    nombre_remitente: 'Isabel Castro',
    asunto: 'Devolución lijadora orbital - mal funcionamiento',
    cuerpo: `Buenas,

El mes pasado compré una lijadora orbital Black&Decker (referencia BDERO100)
con su garantía de 2 años.

Desde hace una semana hace un ruido extraño y vibra más de lo normal.
La llevo usando menos de 10 horas en total.

¿Cómo procedo para la devolución o reparación en garantía?
Tengo el ticket original y el embalaje completo.

Un saludo,
Isabel Castro`,
    fecha: new Date(Date.now() - 9000000).toISOString() // 2.5h antes
  },
  {
    id: 'sim_006',
    de: 'pedro.alonso.martin@outlook.com',
    nombre_remitente: 'Pedro Alonso Martín',
    asunto: 'Horario de la tienda el domingo',
    cuerpo: `Hola buenos días,
¿Abren el domingo? ¿Y en qué horario?
Quiero ir a comprar unas llaves Allen y una caja de tornillos.
Gracias`,
    fecha: new Date(Date.now() - 600000).toISOString() // 10 min antes
  },
  {
    id: 'sim_007',
    de: 'elena.vidal.constructora@gmail.com',
    nombre_remitente: 'Elena Vidal',
    asunto: 'Reclamación: pedido online llegó incompleto',
    cuerpo: `Estimados señores:

Realicé un pedido online el pasado martes (nº pedido: FER-2024-0892).
El paquete llegó ayer pero FALTABAN los 2 metros de cable eléctrico 2.5mm
que aparecen en el albarán como incluidos.

Exijo que me envíen el material que falta O me devuelvan el importe de dichos artículos.

Espero su respuesta con urgencia.

Elena Vidal`,
    fecha: new Date(Date.now() - 4200000).toISOString() // 70 min antes
  },
  {
    id: 'sim_008',
    de: 'manuel.garcia.contratista@gmail.com',
    nombre_remitente: 'Manuel García',
    asunto: 'Consulta sobre alquiler de andamios',
    cuerpo: `Buenos días,

Me gustaría saber si ofrecen servicio de alquiler de andamios.
Necesito para una reforma de fachada unos 20m2, altura aproximada 6 metros.
¿Durante cuánto tiempo se puede alquilar? ¿Qué precio tendría?

Muchas gracias,
Manuel`,
    fecha: new Date(Date.now() - 10800000).toISOString() // 3h antes
  }
];

// Datos de Google Sheets simulados (lo que devolvería la API real)
const SHEETS_SIMULADOS = {
  FAQs: [
    {
      Pregunta: '¿Cuál es el horario de la tienda?',
      Respuesta: 'Lunes a Viernes: 9:00 a 14:00 y 16:00 a 20:00. Sábados: 9:00 a 14:00. Domingos: CERRADO.',
      Categoría: 'horarios'
    },
    {
      Pregunta: '¿Hacen envíos a domicilio?',
      Respuesta: 'Sí, realizamos envíos a toda España peninsular. El coste es de 4,95€ para pedidos inferiores a 50€, y GRATIS a partir de 50€. El plazo de entrega es de 24-48 horas laborables.',
      Categoría: 'envíos'
    },
    {
      Pregunta: '¿Qué métodos de pago aceptan?',
      Respuesta: 'Aceptamos efectivo, tarjeta de débito y crédito (Visa, Mastercard, American Express), transferencia bancaria y Bizum. También financiación a 0% para compras superiores a 300€.',
      Categoría: 'pagos'
    },
    {
      Pregunta: '¿Tienen factura para empresas?',
      Respuesta: 'Sí, emitimos facturas para autónomos y empresas. Necesitamos CIF/NIF y dirección fiscal. Para clientes habituales de empresa tenemos descuentos especiales del 5-15%.',
      Categoría: 'empresas'
    },
    {
      Pregunta: '¿Alquilan herramientas?',
      Respuesta: 'Sí, disponemos de servicio de alquiler de herramientas profesionales: andamios, hormigoneras, cortadoras de pavimento, compresores y más. Consultar disponibilidad y precios en tienda o por teléfono.',
      Categoría: 'alquiler'
    },
    {
      Pregunta: '¿Tienen aparcamiento?',
      Respuesta: 'Disponemos de zona de carga y descarga frente a la tienda. Parking público a 200 metros en Calle Mayor 45.',
      Categoría: 'ubicación'
    }
  ],
  Productos: [
    {
      Nombre: 'Taladro percutor Bosch GSB 18V-55',
      Precio: '159,00€',
      Descripción: 'Taladro percutor inalámbrico 18V, 55 Nm de par, velocidad variable. Incluye 2 baterías 2Ah, cargador y maletín. Ideal para obra y bricolaje profesional.'
    },
    {
      Nombre: 'Sierra circular Makita HS6601',
      Precio: '189,00€',
      Descripción: 'Sierra circular 1.010W, disco 165mm, profundidad de corte 55mm. Guía de corte paralelo incluida. Fabricación japonesa de alta precisión.'
    },
    {
      Nombre: 'Lijadora orbital Black&Decker BDERO100',
      Precio: '45,00€',
      Descripción: 'Lijadora orbital 450W, plato de 125mm. Bolsa de recogida de polvo. Ideal para acabados finos en madera y metales. Garantía 2 años.'
    },
    {
      Nombre: 'Amoladora angular Dewalt DWE4120',
      Precio: '89,00€',
      Descripción: 'Amoladora angular 720W, disco 115mm, velocidad 11.000 rpm. Protección contra sobrecarga. Empuñadura lateral ajustable.'
    },
    {
      Nombre: 'Brocas SDS+ hormigón 10mm (pack 5)',
      Precio: '12,50€',
      Descripción: 'Pack de 5 brocas SDS+ para hormigón y piedra. Punta de carburo de tungsteno, máxima durabilidad. Compatibles con martillos Bosch, Makita, DeWalt.'
    },
    {
      Nombre: 'Cinta métrica Stanley FatMax 10m',
      Precio: '18,90€',
      Descripción: 'Cinta métrica profesional 10m, bloqueo automático, carcasa antichoque. Hoja de acero templado con recubrimiento nylon. Gancho magnético.'
    },
    {
      Nombre: 'Guantes de trabajo talla L (par)',
      Precio: '8,95€',
      Descripción: 'Guantes de trabajo con palma de cuero reforzado y dorso transpirable. Protección contra cortes y abrasiones. Ajuste con velcro.'
    },
    {
      Nombre: 'Disco de corte piedra 115mm',
      Precio: '3,20€',
      Descripción: 'Disco de corte para amoladora angular 115mm. Especial para piedra, terrazo y cerámica. Grosor 3mm, agujero 22,23mm.'
    }
  ],
  Políticas: [
    {
      Tema: 'Devoluciones',
      Descripción: 'Aceptamos devoluciones en los primeros 15 días desde la compra si el producto está sin usar y en su embalaje original. Para productos defectuosos o en garantía, el plazo es el de la garantía del fabricante (mínimo 2 años). El reembolso se hace en el mismo método de pago original en un plazo de 3-5 días laborables.'
    },
    {
      Tema: 'Garantía',
      Descripción: 'Todos nuestros productos tienen la garantía legal de 2 años. Para herramientas de uso profesional, gestionamos el servicio técnico directamente con el fabricante. En caso de defecto probado, sustituimos el producto o lo reparamos sin coste.'
    },
    {
      Tema: 'Pedidos online incompletos',
      Descripción: 'Si un pedido llega incompleto, el cliente debe comunicarlo en las primeras 48 horas. Enviamos el material faltante con envío urgente sin coste adicional o, si el cliente lo prefiere, abonamos el importe en 24-48 horas.'
    },
    {
      Tema: 'Envíos',
      Descripción: 'Envíos por MRW y SEUR. Entrega en 24h para pedidos antes de las 14:00h. 48h para el resto. Penínula únicamente. Islas Canarias y Baleares consultar.'
    },
    {
      Tema: 'Precios para empresa',
      Descripción: 'Clientes empresa y autónomos: descuento del 5% en compras superiores a 100€, 10% en superiores a 500€, 15% en superiores a 1.000€. Necesario presentar CIF. Pago a 30 días para empresas con cuenta abierta.'
    },
    {
      Tema: 'Alquiler de herramientas',
      Descripción: 'Disponemos de servicio de alquiler: andamios (15€/día), hormigonera 150L (25€/día), cortadora de pavimento (35€/día), compresor (20€/día). Fianza reembolsable del 50% del valor. Mínimo 1 día, máximo 30 días.'
    }
  ],
  Clientes_VIP: [
    {
      Email: 'lucia.fernandez.obra@empresa-construccion.es',
      Nombre: 'Lucía Fernández - Construcciones Fernández S.L.',
      Instrucciones_especiales: 'Cliente empresa, descuento fijo del 12%. Pago a 30 días aprobado. Puede hacer pedidos sin validación previa hasta 2.000€. Asignar siempre prioridad ALTA. Contacto preferido: email.'
    }
  ]
};

// Genera un email nuevo de los simulados (simula que llegan emails nuevos)
function obtenerEmailsNuevos() {
  return EMAILS_SIMULADOS;
}

function obtenerDatosSheets() {
  return SHEETS_SIMULADOS;
}

module.exports = {
  obtenerEmailsNuevos,
  obtenerDatosSheets,
  EMAILS_SIMULADOS,
  SHEETS_SIMULADOS
};
