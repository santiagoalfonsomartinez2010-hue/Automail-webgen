import React, { useState, useRef, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Send } from 'lucide-react';

/* ============================================================
   PALETA DE COLORES
   ============================================================ */
const C = {
  fondo: '#0B0D14',
  card: '#0F1117',
  borde: '#1E2130',
  violeta: '#6366F1',
  verde: '#10B981',
  amarillo: '#F59E0B',
  rojo: '#EF4444',
  azul: '#3B82F6',
  texto: '#E5E7EB',
  textoSuave: '#9CA3AF'
};

/* ============================================================
   DATOS SIMULADOS (todo el "backend" vive aquí)
   ============================================================ */

// Fecha de hoy en formato español para las facturas
const HOY = new Date('2026-06-27T09:00:00').toLocaleDateString('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

// Color del badge según la categoría de la factura
const COLOR_CATEGORIA = {
  Materiales: C.violeta,
  Subcontrata: C.azul,
  Equipamiento: C.amarillo,
  Servicios: C.verde
};

// TAB 1 — Facturas procesadas hoy
const FACTURAS = [
  { proveedor: 'Porcelanosa Madrid', categoria: 'Materiales', importe: 8450, estado: 'alerta', nota: '+40% vs mes anterior' },
  { proveedor: 'Electricidad Hnos. Ruiz', categoria: 'Subcontrata', importe: 2100, estado: 'procesada' },
  { proveedor: 'Leroy Merlin', categoria: 'Materiales', importe: 3200, estado: 'procesada' },
  { proveedor: 'Fontanería López', categoria: 'Subcontrata', importe: 4800, estado: 'procesada' },
  { proveedor: 'Alquiler andamios', categoria: 'Equipamiento', importe: 650, estado: 'procesada' },
  { proveedor: 'Gestoría Fernández', categoria: 'Servicios', importe: 380, estado: 'procesada' }
];

// TAB 2 — Cobros pendientes (lo que nos deben)
const COBROS = [
  { cliente: 'Ático Salamanca', importe: 12400, vence: 'Vence HOY', nivel: 'rojo' },
  { cliente: 'Inversiones Chamberí', importe: 28000, vence: 'Vence en 5 días', nivel: 'amarillo' },
  { cliente: 'Local Calle Serrano', importe: 8900, vence: 'Vence en 15 días', nivel: 'verde' }
];

// TAB 2 — Pagos pendientes (lo que debemos)
const PAGOS = [
  { proveedor: 'Leroy Merlin', importe: 3200, vence: 'Vence en 3 días', nivel: 'amarillo' },
  { proveedor: 'Fontanería López', importe: 4800, vence: 'Vence en 12 días', nivel: 'verde' }
];

// TAB 3 — Datos del informe de junio
const SEMANAS = [
  { semana: 'Semana 1', ingresos: 11200, gastos: 7800 },
  { semana: 'Semana 2', ingresos: 14600, gastos: 9200 },
  { semana: 'Semana 3', ingresos: 12800, gastos: 8100 },
  { semana: 'Semana 4', ingresos: 9600, gastos: 6350 }
];

const GASTOS_CATEGORIA = [
  { name: 'Materiales', value: 45 },
  { name: 'Subcontratas', value: 34 },
  { name: 'Equipamiento', value: 10 },
  { name: 'Servicios', value: 7 },
  { name: 'Otros', value: 4 }
];
// Colores de cada porción de la tarta
const COLORES_TARTA = [C.violeta, C.azul, C.amarillo, C.verde, C.textoSuave];

const TOP_CLIENTES = [
  { nombre: 'Inversiones Chamberí', importe: 14200 },
  { nombre: 'Familia Rodríguez', importe: 12400 },
  { nombre: 'Inversiones Serrano S.L.', importe: 10050 }
];

const TOP_PROVEEDORES = [
  { nombre: 'Porcelanosa Madrid', importe: 8450 },
  { nombre: 'Fontanería López', importe: 4800 },
  { nombre: 'Leroy Merlin', importe: 3200 }
];

// TAB 4 — Obras activas con su desglose financiero completo
const OBRAS = [
  {
    nombre: 'Reforma Integral · Ático Salamanca',
    cliente: 'Familia Rodríguez',
    estado: 'En curso',
    estadoDetalle: 'semana 3 de 6',
    direccion: 'C/ Salamanca 42, Madrid',
    presupuesto: 48000,
    cobrado: 24000,
    pendiente: 24000,
    progreso: 50,
    secciones: [
      {
        titulo: 'Materiales',
        items: [
          { desc: 'Porcelanosa (azulejos baño)', importe: 3200, hecho: true },
          { desc: 'Leroy Merlin (pintura)', importe: 450, hecho: true },
          { desc: 'Ventanas Cortizo', importe: 2800, hecho: false },
          { desc: 'Suelo tarima roble', importe: 1900, hecho: false }
        ]
      },
      {
        titulo: 'Subcontratas',
        items: [
          { desc: 'Electricidad Hnos. Ruiz', importe: 2100, hecho: true },
          { desc: 'Fontanería López', importe: 1800, hecho: false }
        ]
      },
      {
        titulo: 'Mano de obra',
        items: [
          { desc: 'Semana 1 y 2 (4 oficiales)', importe: 4800, hecho: true },
          { desc: 'Semanas 3-6 (estimado)', importe: 9600, hecho: false }
        ]
      },
      {
        titulo: 'Equipamiento',
        items: [
          { desc: 'Alquiler andamios', importe: 650, hecho: true },
          { desc: 'Alquiler contenedor', importe: 320, hecho: false }
        ]
      }
    ],
    gastado: 11200,
    estimadoTotal: 27620,
    margen: 20380,
    margenPct: 42,
    nota: null
  },
  {
    nombre: 'Reforma Cocina · Chamberí',
    cliente: 'D. Antonio Vega',
    estado: 'En curso',
    estadoDetalle: 'semana 1 de 3',
    direccion: 'C/ Alonso Cano 18, Madrid',
    presupuesto: 18500,
    cobrado: 9250,
    pendiente: 9250,
    progreso: 33,
    secciones: [
      {
        titulo: 'Materiales',
        items: [
          { desc: 'Muebles cocina Santos', importe: 4200, hecho: true },
          { desc: 'Encimera silestone', importe: 1800, hecho: false },
          { desc: 'Electrodomésticos Bosch', importe: 2400, hecho: false }
        ]
      },
      {
        titulo: 'Subcontratas',
        items: [
          { desc: 'Fontanería López', importe: 850, hecho: true },
          { desc: 'Electricidad Hnos. Ruiz', importe: 600, hecho: false }
        ]
      },
      {
        titulo: 'Mano de obra',
        items: [
          { desc: 'Semana 1 (2 oficiales)', importe: 1600, hecho: true },
          { desc: 'Semanas 2-3 (estimado)', importe: 3200, hecho: false }
        ]
      },
      {
        titulo: 'Equipamiento',
        items: [{ desc: 'Herramientas especiales', importe: 280, hecho: true }]
      }
    ],
    gastado: 6930,
    estimadoTotal: 14930,
    margen: 3570,
    margenPct: 19,
    nota: null
  },
  {
    nombre: 'Reforma Baño · Retiro',
    cliente: 'Sra. Carmen López',
    estado: 'Terminada',
    estadoDetalle: null,
    direccion: 'C/ Narváez 8, Madrid',
    presupuesto: 11200,
    cobrado: 11200,
    pendiente: 0,
    progreso: 100,
    secciones: [
      {
        titulo: 'Materiales',
        items: [
          { desc: 'Porcelanosa (sanitarios)', importe: 2800, hecho: true },
          { desc: 'Azulejos importación', importe: 1200, hecho: true },
          { desc: 'Griferías Hansgrohe', importe: 950, hecho: true }
        ]
      },
      {
        titulo: 'Subcontratas',
        items: [
          { desc: 'Fontanería López', importe: 1400, hecho: true },
          { desc: 'Electricidad Hnos. Ruiz', importe: 480, hecho: true }
        ]
      },
      {
        titulo: 'Mano de obra',
        items: [{ desc: '2 semanas (2 oficiales)', importe: 3200, hecho: true }]
      },
      {
        titulo: 'Equipamiento',
        items: [{ desc: 'Herramientas', importe: 180, hecho: true }]
      }
    ],
    gastado: 10210,
    estimadoTotal: null,
    margen: 990,
    margenPct: 9,
    nota: 'Margen bajo por retrasos en materiales. Revisar proveedor.'
  },
  {
    nombre: 'Local Comercial · Calle Serrano',
    cliente: 'Inversiones Serrano S.L.',
    estado: 'Planificada',
    estadoDetalle: null,
    direccion: 'C/ Serrano 94, Madrid',
    presupuesto: 67000,
    cobrado: 20100,
    pendiente: 46900,
    progreso: 0,
    inicio: '1 julio 2026',
    secciones: [
      {
        titulo: 'Materiales estimados',
        items: [
          { desc: 'Suelos técnicos', importe: 8400, hecho: false },
          { desc: 'Tabiquería y pladur', importe: 5200, hecho: false },
          { desc: 'Iluminación comercial', importe: 6800, hecho: false },
          { desc: 'Pintura y revestimientos', importe: 3100, hecho: false }
        ]
      },
      {
        titulo: 'Subcontratas estimadas',
        items: [
          { desc: 'Instalación eléctrica completa', importe: 7200, hecho: false },
          { desc: 'Climatización', importe: 9400, hecho: false },
          { desc: 'Fontanería', importe: 2800, hecho: false }
        ]
      },
      {
        titulo: 'Mano de obra estimada',
        items: [{ desc: '8 semanas (5 oficiales)', importe: 16000, hecho: false }]
      },
      {
        titulo: 'Equipamiento estimado',
        items: [{ desc: 'Andamios y maquinaria', importe: 2400, hecho: false }]
      }
    ],
    gastado: 0,
    estimadoTotal: 61300,
    margen: 5700,
    margenPct: 8.5,
    nota: 'Margen ajustado. Considerar renegociar materiales.'
  }
];

// Color de la obra según su estado (barra de progreso y badge)
function colorEstado(estado) {
  if (estado === 'Planificada') return C.azul; // 🔵
  if (estado === 'Terminada') return C.verde; // 🟢
  return C.amarillo; // 🟡 En curso
}

// Emoji del estado de la obra
function emojiEstado(estado) {
  if (estado === 'Planificada') return '🔵';
  if (estado === 'Terminada') return '🟢';
  return '🟡';
}

/* ============================================================
   CHAT CON ELENA — system prompt y mensaje inicial
   ============================================================ */
const SYSTEM_PROMPT = `Eres Elena, empleada de contabilidad de Reformas Meridiano S.L., empresa de reformas en Madrid. Llevas 2 meses en la empresa.

DATOS DE HOY:
- Has procesado 6 facturas
- Detectaste alerta: Porcelanosa +40% vs mes anterior (8.450€ vs 6.020€)
- Cobro urgente: Ático Salamanca 12.400€ vence hoy
- Balance del mes: +16.750€

OBRAS ACTIVAS:
- Ático Salamanca: reforma integral, 48.000€, semana 3 de 6, margen 42%
- Chamberí: reforma cocina, 18.500€, semana 1 de 3, margen 19%
- Retiro: baño terminado, margen bajo 9% por retrasos en materiales
- Serrano: local comercial, 67.000€, pendiente de iniciar el 1 julio

Responde siempre como Elena en primera persona, de forma concisa y profesional. Nunca digas que eres una IA. Si te preguntan por números, usa los datos reales de arriba.`;

const MENSAJE_INICIAL =
  'Buenos días. Soy Elena, tu empleada de contabilidad. Hoy he procesado 6 facturas de Reformas Meridiano y he detectado 2 alertas importantes. La más urgente: Ático Salamanca tiene un cobro de 12.400€ que vence hoy. ¿Quieres que prepare el email de recordatorio?';

/* ============================================================
   UTILIDADES
   ============================================================ */

// Formatea un número como importe en euros (formato español)
function euro(n) {
  return n.toLocaleString('es-ES') + '€';
}

// Mapea un nivel de urgencia a su color y emoji de semáforo
const SEMAFORO = {
  rojo: { color: C.rojo, emoji: '🔴' },
  amarillo: { color: C.amarillo, emoji: '🟡' },
  verde: { color: C.verde, emoji: '🟢' }
};

/* ============================================================
   COMPONENTE PRINCIPAL (toda la demo en un solo componente)
   ============================================================ */
export default function App() {
  const [tab, setTab] = useState(0); // Tab activa del panel central
  const [obraAbierta, setObraAbierta] = useState(null); // Índice de obra expandida

  // Estado del chat. Arranca con el saludo de Elena.
  const [mensajes, setMensajes] = useState([{ role: 'assistant', content: MENSAJE_INICIAL }]);
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const finChatRef = useRef(null);

  // Auto-scroll al último mensaje del chat
  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  // Llama a la API de Anthropic directamente desde el frontend
  async function enviarMensaje() {
    const texto = entrada.trim();
    if (!texto || cargando) return;

    const nuevos = [...mensajes, { role: 'user', content: texto }];
    setMensajes(nuevos);
    setEntrada('');
    setCargando(true);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setMensajes((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ No encuentro la API key. Configura VITE_ANTHROPIC_API_KEY en tu archivo .env para poder responderte.'
        }
      ]);
      setCargando(false);
      return;
    }

    // Construimos el historial para la API: debe empezar por un mensaje "user"
    const apiMessages = [];
    for (const m of nuevos) {
      if (apiMessages.length === 0 && m.role !== 'user') continue;
      apiMessages.push({ role: m.role, content: m.content });
    }

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages
        })
      });

      if (!res.ok) {
        throw new Error('Error ' + res.status);
      }

      const data = await res.json();
      const respuesta = data.content?.map((b) => b.text).join('') || '(sin respuesta)';
      setMensajes((prev) => [...prev, { role: 'assistant', content: respuesta }]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Disculpa, ha habido un problema al conectar con el sistema. Inténtalo de nuevo en un momento.'
        }
      ]);
    } finally {
      setCargando(false);
    }
  }

  // Enter envía, Shift+Enter inserta salto de línea
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  }

  const TABS = ['Facturas de hoy', 'Pagos y cobros', 'Informe de junio', 'Obras activas'];

  return (
    <div style={S.app}>
      {/* ====================================================
          COLUMNA 1 — SIDEBAR IZQUIERDO
          ==================================================== */}
      <aside style={S.sidebar}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {/* Avatar con punto verde pulsante */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <div style={S.avatarGrande}>E</div>
            <span style={S.puntoEstado} className="punto-pulsante" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Elena</div>
          <div style={{ fontSize: 13, color: C.textoSuave, marginTop: 2 }}>Empleada de Contabilidad</div>
          <div style={{ fontSize: 12, color: C.violeta, fontWeight: 600, marginTop: 6 }}>Reformas Meridiano S.L.</div>
          <div style={S.badgeTrabajando}>
            <span style={{ ...S.dot, background: C.verde }} /> Trabajando ahora
          </div>
        </div>

        {/* Stats de hoy */}
        <div style={{ marginTop: 24 }}>
          <div style={S.tituloStats}>HOY</div>
          <StatLinea etiqueta="Facturas procesadas" valor="6" />
          <StatLinea etiqueta="Alertas detectadas" valor="2" color={C.amarillo} />
          <StatLinea etiqueta="Cobros pendientes" valor="3" />
          <StatLinea etiqueta="Pagos pendientes" valor="2" />
        </div>

        {/* Stats del mes */}
        <div style={{ marginTop: 20 }}>
          <div style={S.tituloStats}>ESTE MES</div>
          <StatLinea etiqueta="Ingresos" valor={euro(48200)} />
          <StatLinea etiqueta="Gastos" valor={euro(31450)} />
          <StatLinea etiqueta="Balance" valor={'+' + euro(16750)} color={C.verde} negrita />
        </div>

        <div style={{ marginTop: 'auto', fontSize: 11, color: C.textoSuave, textAlign: 'center', paddingTop: 16 }}>
          Demo · Empleado de Contabilidad IA
        </div>
      </aside>

      {/* ====================================================
          COLUMNA 2 — PANEL CENTRAL
          ==================================================== */}
      <main style={S.central}>
        {/* Cabecera con tabs */}
        <div style={S.tabs}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                ...S.tab,
                color: tab === i ? C.texto : C.textoSuave,
                borderBottom: tab === i ? `2px solid ${C.violeta}` : '2px solid transparent'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Contenido con scroll interno */}
        <div style={S.contenidoCentral}>
          {tab === 0 && <TabFacturas />}
          {tab === 1 && <TabPagosCobros />}
          {tab === 2 && <TabInforme />}
          {tab === 3 && <TabObras obraAbierta={obraAbierta} setObraAbierta={setObraAbierta} />}
        </div>
      </main>

      {/* ====================================================
          COLUMNA 3 — CHAT CON ELENA
          ==================================================== */}
      <aside style={S.chat}>
        {/* Header del chat */}
        <div style={S.chatHeader}>
          <div style={{ position: 'relative' }}>
            <div style={S.avatarPequeno}>E</div>
            <span style={{ ...S.puntoEstadoPeq }} className="punto-pulsante" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Elena</div>
            <div style={{ fontSize: 11, color: C.verde, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ ...S.dot, background: C.verde }} /> Trabajando ahora
            </div>
          </div>
        </div>

        {/* Mensajes */}
        <div style={S.chatMensajes}>
          {mensajes.map((m, i) => (
            <Burbuja key={i} role={m.role} texto={m.content} />
          ))}
          {cargando && <Burbuja role="assistant" texto="Elena está escribiendo…" tenue />}
          <div ref={finChatRef} />
        </div>

        {/* Input */}
        <div style={S.chatInput}>
          <textarea
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe a Elena…"
            rows={1}
            style={S.textarea}
          />
          <button
            onClick={enviarMensaje}
            disabled={cargando || !entrada.trim()}
            style={{
              ...S.botonEnviar,
              opacity: cargando || !entrada.trim() ? 0.5 : 1,
              cursor: cargando || !entrada.trim() ? 'default' : 'pointer'
            }}
            aria-label="Enviar"
          >
            <Send size={18} />
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ============================================================
   SUBCOMPONENTES DE PRESENTACIÓN
   ============================================================ */

// Línea de estadística del sidebar
function StatLinea({ etiqueta, valor, color, negrita }) {
  return (
    <div style={S.statLinea}>
      <span style={{ color: C.textoSuave, fontSize: 13 }}>{etiqueta}</span>
      <span style={{ color: color || C.texto, fontSize: 13, fontWeight: negrita ? 700 : 600 }}>{valor}</span>
    </div>
  );
}

// TAB 1 — Lista de facturas de hoy
function TabFacturas() {
  return (
    <div>
      <h2 style={S.h2}>Facturas procesadas hoy</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FACTURAS.map((f, i) => {
          const esAlerta = f.estado === 'alerta';
          return (
            <div
              key={i}
              style={{
                ...S.card,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderColor: esAlerta ? C.amarillo : C.borde
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{f.proveedor}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <span
                    style={{
                      ...S.badge,
                      background: COLOR_CATEGORIA[f.categoria] + '22',
                      color: COLOR_CATEGORIA[f.categoria]
                    }}
                  >
                    {f.categoria}
                  </span>
                  <span style={{ fontSize: 12, color: C.textoSuave }}>{HOY}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{euro(f.importe)}</div>
                {esAlerta ? (
                  <div style={{ fontSize: 12, color: C.amarillo, fontWeight: 600, marginTop: 4 }}>
                    ⚠️ ALERTA: {f.nota}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: C.verde, fontWeight: 600, marginTop: 4 }}>✅ Procesada</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// TAB 2 — Pagos y cobros en dos columnas
function TabPagosCobros() {
  return (
    <div>
      <h2 style={S.h2}>Pagos y cobros</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Cobros pendientes */}
        <div>
          <h3 style={S.h3}>Cobros pendientes</h3>
          <div style={{ fontSize: 12, color: C.textoSuave, marginBottom: 10 }}>Lo que nos deben</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {COBROS.map((c, i) => {
              const s = SEMAFORO[c.nivel];
              return (
                <div key={i} style={{ ...S.card, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.cliente}</span>
                    <span style={{ fontSize: 16 }}>{s.emoji}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginTop: 6 }}>{euro(c.importe)}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{c.vence}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagos pendientes */}
        <div>
          <h3 style={S.h3}>Pagos pendientes</h3>
          <div style={{ fontSize: 12, color: C.textoSuave, marginBottom: 10 }}>Lo que debemos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PAGOS.map((p, i) => {
              const s = SEMAFORO[p.nivel];
              return (
                <div key={i} style={{ ...S.card, borderLeft: `3px solid ${s.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.proveedor}</span>
                    <span style={{ fontSize: 16 }}>{s.emoji}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, marginTop: 6 }}>{euro(p.importe)}</div>
                  <div style={{ fontSize: 12, color: s.color, fontWeight: 600, marginTop: 4 }}>{p.vence}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Tooltip oscuro reutilizable para las gráficas
function TooltipOscuro({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: C.fondo, border: `1px solid ${C.borde}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      {label && <div style={{ marginBottom: 4, color: C.textoSuave }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.payload.fill }}>
          {p.name}: {typeof p.value === 'number' ? (p.unit === '%' ? p.value + '%' : euro(p.value)) : p.value}
        </div>
      ))}
    </div>
  );
}

// TAB 3 — Informe de junio con gráficas
function TabInforme() {
  return (
    <div>
      <h2 style={S.h2}>Informe de junio</h2>

      {/* Balance grande */}
      <div style={{ ...S.card, textAlign: 'center', padding: 24, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.textoSuave, marginBottom: 6 }}>Balance del mes</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: C.verde }}>+{euro(16750)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Gráfica de barras: ingresos vs gastos por semana */}
        <div style={S.card}>
          <h3 style={S.h3}>Ingresos vs gastos por semana</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SEMANAS} margin={{ top: 10, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borde} vertical={false} />
              <XAxis dataKey="semana" tick={{ fill: C.textoSuave, fontSize: 11 }} axisLine={{ stroke: C.borde }} tickLine={false} />
              <YAxis tick={{ fill: C.textoSuave, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TooltipOscuro />} cursor={{ fill: '#ffffff08' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="ingresos" name="Ingresos" fill={C.verde} radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill={C.violeta} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de tarta: gastos por categoría */}
        <div style={S.card}>
          <h3 style={S.h3}>Gastos por categoría</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={GASTOS_CATEGORIA}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                innerRadius={40}
                paddingAngle={2}
                label={({ value }) => value + '%'}
                labelLine={false}
                stroke="none"
              >
                {GASTOS_CATEGORIA.map((entry, i) => (
                  <Cell key={i} fill={COLORES_TARTA[i]} />
                ))}
              </Pie>
              <Tooltip content={<TooltipOscuro />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tops */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={S.card}>
          <h3 style={S.h3}>Top 3 clientes por ingreso</h3>
          {TOP_CLIENTES.map((c, i) => (
            <RankingLinea key={i} pos={i + 1} nombre={c.nombre} valor={euro(c.importe)} color={C.verde} />
          ))}
        </div>
        <div style={S.card}>
          <h3 style={S.h3}>Top 3 proveedores por gasto</h3>
          {TOP_PROVEEDORES.map((p, i) => (
            <RankingLinea key={i} pos={i + 1} nombre={p.nombre} valor={euro(p.importe)} color={C.violeta} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Línea de ranking (top clientes / proveedores)
function RankingLinea({ pos, nombre, valor, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.borde}` }}>
      <span style={{ ...S.rankBadge, color }}>{pos}</span>
      <span style={{ flex: 1, fontSize: 14 }}>{nombre}</span>
      <span style={{ fontWeight: 700, fontSize: 14, color }}>{valor}</span>
    </div>
  );
}

// TAB 4 — Obras activas (lista expandible)
function TabObras({ obraAbierta, setObraAbierta }) {
  return (
    <div>
      <h2 style={S.h2}>Obras activas</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {OBRAS.map((o, i) => {
          const abierta = obraAbierta === i;
          const color = colorEstado(o.estado);
          return (
            <div key={i} style={{ ...S.card, padding: 0, overflow: 'hidden' }}>
              {/* Cabecera clicable */}
              <button
                onClick={() => setObraAbierta(abierta ? null : i)}
                style={S.obraCabecera}
              >
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{o.nombre}</div>
                  <div style={{ fontSize: 12, color: C.textoSuave, marginTop: 4 }}>
                    {o.cliente} · {o.direccion}
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: 12 }}>
                  <div style={{ ...S.badge, background: color + '22', color, display: 'inline-block' }}>
                    {emojiEstado(o.estado)} {o.estado}
                    {o.estadoDetalle ? ` · ${o.estadoDetalle}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: C.textoSuave, marginTop: 6 }}>{euro(o.presupuesto)}</div>
                </div>
                <span style={{ color: C.textoSuave, fontSize: 14, transform: abierta ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>
                  ▶
                </span>
              </button>

              {/* Barra de progreso (siempre visible) */}
              <div style={{ padding: '0 16px 14px' }}>
                <div style={S.progresoFondo}>
                  <div style={{ ...S.progresoRelleno, width: o.progreso + '%', background: color }} />
                </div>
                <div style={{ fontSize: 11, color: C.textoSuave, marginTop: 4 }}>{o.progreso}% completado</div>
              </div>

              {/* Detalle expandible */}
              {abierta && <DetalleObra obra={o} color={color} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Detalle financiero de una obra expandida
function DetalleObra({ obra, color }) {
  const terminada = obra.estado === 'Terminada';
  return (
    <div style={{ borderTop: `1px solid ${C.borde}`, padding: 16 }}>
      {/* Resumen económico */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
        <Resumen etiqueta="Cobrado" valor={euro(obra.cobrado)} color={C.verde} />
        <Resumen etiqueta="Pendiente" valor={euro(obra.pendiente)} color={obra.pendiente > 0 ? C.amarillo : C.textoSuave} />
        {obra.inicio && <Resumen etiqueta="Inicio previsto" valor={obra.inicio} color={C.azul} />}
      </div>

      {/* Secciones de gasto */}
      {obra.secciones.map((sec, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={S.seccionTitulo}>{sec.titulo.toUpperCase()}</div>
          {sec.items.map((it, j) => (
            <div key={j} style={S.itemGasto}>
              <span>
                {it.hecho ? '✅' : '⏳'} {it.desc}
              </span>
              <span style={{ fontWeight: 600, color: it.hecho ? C.texto : C.textoSuave }}>{euro(it.importe)}</span>
            </div>
          ))}
        </div>
      ))}

      {/* Totales */}
      <div style={{ borderTop: `1px solid ${C.borde}`, paddingTop: 12, marginTop: 4 }}>
        {obra.gastado > 0 && <TotalLinea etiqueta="Total gastado hasta ahora" valor={euro(obra.gastado)} />}
        {obra.estimadoTotal && (
          <TotalLinea etiqueta="Total estimado obra completa" valor={euro(obra.estimadoTotal)} />
        )}
        <TotalLinea
          etiqueta={terminada ? 'Margen real' : 'Margen estimado'}
          valor={`${euro(obra.margen)} (${obra.margenPct}%)`}
          color={C.verde}
          negrita
        />
      </div>

      {/* Nota de Elena */}
      {obra.nota && (
        <div style={S.notaElena}>
          <span style={{ fontWeight: 600 }}>Nota de Elena:</span> ⚠️ {obra.nota}
        </div>
      )}
    </div>
  );
}

function Resumen({ etiqueta, valor, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.textoSuave }}>{etiqueta}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color || C.texto, marginTop: 2 }}>{valor}</div>
    </div>
  );
}

function TotalLinea({ etiqueta, valor, color, negrita }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{ fontSize: 13, color: C.textoSuave }}>{etiqueta}</span>
      <span style={{ fontSize: 13, fontWeight: negrita ? 700 : 600, color: color || C.texto }}>{valor}</span>
    </div>
  );
}

// Burbuja de mensaje del chat
function Burbuja({ role, texto, tenue }) {
  const esElena = role === 'assistant';
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: esElena ? 'flex-start' : 'flex-end',
        animation: 'aparecer .25s ease'
      }}
    >
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 12px',
          borderRadius: 12,
          fontSize: 13.5,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          background: esElena ? C.card : C.violeta,
          color: esElena ? C.texto : '#fff',
          border: esElena ? `1px solid ${C.borde}` : 'none',
          opacity: tenue ? 0.6 : 1,
          borderTopLeftRadius: esElena ? 2 : 12,
          borderTopRightRadius: esElena ? 12 : 2
        }}
      >
        {texto}
      </div>
    </div>
  );
}

/* ============================================================
   ESTILOS (objetos inline reutilizables)
   ============================================================ */
const S = {
  app: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    background: C.fondo,
    color: C.texto
  },

  // Sidebar
  sidebar: {
    width: 240,
    minWidth: 240,
    background: C.card,
    borderRight: `1px solid ${C.borde}`,
    padding: 20,
    display: 'flex',
    flexDirection: 'column'
  },
  avatarGrande: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.violeta}, #8B5CF6)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    fontWeight: 700,
    color: '#fff'
  },
  puntoEstado: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: C.verde,
    border: `2px solid ${C.card}`
  },
  badgeTrabajando: {
    marginTop: 10,
    fontSize: 12,
    color: C.verde,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: C.verde + '1a',
    padding: '4px 10px',
    borderRadius: 999
  },
  dot: { width: 7, height: 7, borderRadius: '50%', display: 'inline-block' },
  tituloStats: {
    fontSize: 11,
    letterSpacing: 1,
    color: C.textoSuave,
    fontWeight: 700,
    marginBottom: 8
  },
  statLinea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: `1px solid ${C.borde}`
  },

  // Panel central
  central: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  tabs: {
    display: 'flex',
    gap: 4,
    padding: '0 24px',
    borderBottom: `1px solid ${C.borde}`,
    background: C.fondo
  },
  tab: {
    background: 'transparent',
    border: 'none',
    padding: '16px 14px',
    fontSize: 14,
    fontWeight: 600,
    transition: 'color .15s'
  },
  contenidoCentral: { flex: 1, overflowY: 'auto', padding: 24 },
  h2: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  h3: { fontSize: 14, fontWeight: 600, marginBottom: 8 },
  card: {
    background: C.card,
    border: `1px solid ${C.borde}`,
    borderRadius: 12,
    padding: 16
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: C.fondo,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    border: `1px solid ${C.borde}`
  },

  // Obras
  obraCabecera: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    color: C.texto
  },
  progresoFondo: {
    height: 8,
    background: C.fondo,
    borderRadius: 999,
    overflow: 'hidden',
    border: `1px solid ${C.borde}`
  },
  progresoRelleno: { height: '100%', borderRadius: 999, transition: 'width .4s' },
  seccionTitulo: {
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: 700,
    color: C.violeta,
    marginBottom: 6
  },
  itemGasto: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    padding: '3px 0',
    color: C.texto
  },
  notaElena: {
    marginTop: 14,
    background: C.amarillo + '14',
    border: `1px solid ${C.amarillo}55`,
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: C.amarillo
  },

  // Chat
  chat: {
    width: 360,
    minWidth: 360,
    background: C.card,
    borderLeft: `1px solid ${C.borde}`,
    display: 'flex',
    flexDirection: 'column'
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderBottom: `1px solid ${C.borde}`
  },
  avatarPequeno: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.violeta}, #8B5CF6)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#fff'
  },
  puntoEstadoPeq: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: C.verde,
    border: `2px solid ${C.card}`
  },
  chatMensajes: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  chatInput: {
    display: 'flex',
    gap: 8,
    padding: 12,
    borderTop: `1px solid ${C.borde}`,
    alignItems: 'flex-end'
  },
  textarea: {
    flex: 1,
    background: C.fondo,
    border: `1px solid ${C.borde}`,
    borderRadius: 10,
    color: C.texto,
    padding: '10px 12px',
    fontSize: 13.5,
    resize: 'none',
    maxHeight: 120,
    outline: 'none'
  },
  botonEnviar: {
    background: C.violeta,
    border: 'none',
    borderRadius: 10,
    width: 40,
    height: 40,
    minWidth: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  }
};
