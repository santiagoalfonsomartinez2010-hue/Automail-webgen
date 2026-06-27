// =============================================
// Chat.jsx — Panel de chat con IA (Anthropic directo)
// Llama a api.anthropic.com desde el navegador
// =============================================

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useApp } from '../App.jsx';

const MENSAJE_INICIAL = 'Buenos días. Hoy he revisado 8 CVs nuevos para la vacante de oficial de primera. 3 encajan con el perfil — he agendado entrevistas con Pedro para el jueves. También te aviso: el contrato de José Fernández vence en 4 días. ¿Lo renovamos?';

const SUGERENCIAS = [
  '¿Hay contratos urgentes?',
  '¿Cuándo vuelve David García?',
  'Resumen de candidatos',
  'Onboarding pendiente'
];

function buildSystemPrompt(nombre) {
  return `Eres el asistente de RRHH con IA de Reformas Europa S.L., una empresa de reformas integrales en Madrid. Estás ayudando a ${nombre}, el/la responsable de Recursos Humanos.

Contexto de la empresa:
- 17 empleados: 14 trabajando, 2 de vacaciones (David García hasta 30 jun, Fernando Blanco hasta 5 jul), 1 de baja médica (Miguel Herrero desde 20 jun)
- Obras activas: Ático (Pedro Ruiz - jefe), Chamberí (Antonio Vega - jefe), Serrano
- Candidatos hoy: 8 CVs procesados — 2 encajan bien (José Fernández Ruiz y Carlos Peña Martínez), 2 posibles, 4 no encajan
- Alerta urgente: contrato de José Fernández vence el 31 de julio (en 4 días)
- Onboarding en curso: Alejandro Ruiz (37% completado, incorporación 30 jun) y Marcos Jiménez (12%, incorporación 7 jul)

Tu rol:
- Ayudar con gestión de contratos, candidatos, ausencias y onboarding
- Responder en español, de forma concisa y profesional
- Proponer acciones concretas cuando sea útil
- Dirigirte al empleado como ${nombre}`;
}

function generarRespuestaDemo(mensaje, nombre) {
  const m = mensaje.toLowerCase();

  if (m.includes('contrato') || m.includes('vence') || m.includes('urgente')) {
    return `El contrato más urgente es el de José Fernández — vence el **31 de julio**, en 4 días. Si quieres renovarlo, necesitamos iniciar los trámites hoy. Manuel Torres también vence el 15 de agosto, tenemos algo más de margen. ¿Proceso la renovación de José?`;
  }
  if (m.includes('david') || m.includes('vacaciones') || m.includes('vuelve')) {
    return `David García vuelve el lunes **30 de junio**. Tiene pendiente ser reasignado a la obra de Serrano. Te recomiendo coordinarlo con Javier Moreno para que lo integre en el equipo esa misma semana.`;
  }
  if (m.includes('candidato') || m.includes('cv') || m.includes('resumen')) {
    return `Resumen de hoy: **8 CVs procesados**.\n\n✅ **Encajan (2):** José Fernández Ruiz (92/100, Of. 1ª Albañilería) y Carlos Peña Martínez (88/100, Encargado).\n🟡 **Posibles (2):** Andrés Moreno y Laura Gómez.\n❌ **No encajan (4):** rechazos enviados automáticamente.\n\n¿Confirmo las entrevistas para el jueves con Pedro Ruiz?`;
  }
  if (m.includes('onboarding') || m.includes('pendiente') || m.includes('incorporación')) {
    return `Hay 2 incorporaciones en curso:\n\n1. **Alejandro Ruiz** (Of.1ª Albañilería, Serrano) — 3/8 pasos completados (37%). Pendiente: EPIs, firma contrato, alta SS, WhatsApp y PRL.\n2. **Marcos Jiménez** (Peón, Chamberí) — 1/8 pasos (12%). Empieza el 7 de julio, pendiente casi todo.\n\n¿Quieres que prepare un recordatorio para los pasos urgentes?`;
  }
  if (m.includes('renovar') || m.includes('sí') || m.includes('si') || m.includes('ok') || m.includes('adelante')) {
    return `Perfecto, ${nombre}. Voy a preparar la propuesta de renovación para José Fernández con las mismas condiciones del contrato actual (Obra · vence 31 jul). ¿Quieres que sea por 3 meses más (hasta 31 oct) o indefinido?`;
  }
  if (m.includes('baja') || m.includes('miguel') || m.includes('médica')) {
    return `Miguel Herrero está de baja médica desde el 20 de junio — hoy es el día 7. Sin fecha estimada de regreso por el momento. Su obra (pintura en Ático) está siendo cubierta temporalmente. ¿Quieres que busque un sustituto entre los candidatos de hoy?`;
  }

  return `Entendido, ${nombre}. Estoy revisando esa consulta. Por ahora las prioridades más urgentes son: renovar el contrato de José Fernández (vence en 4 días) y confirmar las entrevistas para el jueves. ¿Te ayudo con algo concreto?`;
}

export default function Chat() {
  const { nombre, foto } = useApp();

  const [mensajes, setMensajes] = useState([
    { id: 1, rol: 'assistant', texto: MENSAJE_INICIAL }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando]   = useState(false);
  const historialRef = useRef([]);
  const scrollRef    = useRef(null);
  const textareaRef  = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, cargando]);

  async function enviarMensaje(textoOverride) {
    const texto = (textoOverride ?? inputTexto).trim();
    if (!texto || cargando) return;

    const msgUsuario = { id: Date.now(), rol: 'user', texto };
    setMensajes(prev => [...prev, msgUsuario]);
    setInputTexto('');
    setCargando(true);

    historialRef.current.push({ role: 'user', content: texto });

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

    if (!apiKey) {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
      const respDemo = generarRespuestaDemo(texto, nombre);
      historialRef.current.push({ role: 'assistant', content: respDemo });
      setMensajes(prev => [...prev, { id: Date.now() + 1, rol: 'assistant', texto: respDemo }]);
      setCargando(false);
      return;
    }

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-allow-browser': 'true',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: buildSystemPrompt(nombre),
          messages: historialRef.current
        })
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const textoResp = data.content?.[0]?.text ?? '…';
      historialRef.current.push({ role: 'assistant', content: textoResp });
      setMensajes(prev => [...prev, { id: Date.now() + 1, rol: 'assistant', texto: textoResp }]);
    } catch {
      const fallback = generarRespuestaDemo(texto, nombre);
      historialRef.current.push({ role: 'assistant', content: fallback });
      setMensajes(prev => [...prev, { id: Date.now() + 1, rol: 'assistant', texto: fallback }]);
    } finally {
      setCargando(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border)'
    }}>
      {/* Cabecera del chat */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'var(--accent-light)',
          border: '1px solid var(--accent)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={16} color="var(--accent)" />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 13 }}>Asistente RRHH</p>
          <p style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} />
            En línea
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="scrollable" style={{ flex: 1, padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mensajes.map(msg => (
          <MensajeBurbuja key={msg.id} msg={msg} foto={foto} nombre={nombre} />
        ))}

        {cargando && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <BotAvatar />
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '16px 16px 16px 4px',
              display: 'flex', gap: 4, alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--text-muted)',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sugerencias rápidas */}
      {mensajes.length <= 2 && !cargando && (
        <div style={{
          padding: '0 12px 10px',
          display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0
        }}>
          {SUGERENCIAS.map(s => (
            <button
              key={s}
              onClick={() => enviarMensaje(s)}
              style={{
                padding: '5px 11px',
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: 'var(--bg-main)',
                color: 'var(--text-secondary)',
                fontSize: 11, cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8, alignItems: 'flex-end',
        flexShrink: 0
      }}>
        <textarea
          ref={textareaRef}
          className="input"
          value={inputTexto}
          onChange={e => setInputTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje… (Enter para enviar)"
          rows={1}
          style={{
            resize: 'none', flex: 1,
            maxHeight: 120,
            overflowY: 'auto',
            fontSize: 13,
            lineHeight: 1.5,
            padding: '9px 12px'
          }}
        />
        <button
          className="btn btn-primary"
          onClick={() => enviarMensaje()}
          disabled={!inputTexto.trim() || cargando}
          style={{ padding: '9px 14px', flexShrink: 0 }}
        >
          {cargando
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <Send size={15} />
          }
        </button>
      </div>
    </div>
  );
}

// ---- Subcomponentes ----

function BotAvatar() {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: 'var(--accent-light)',
      border: '1px solid var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Bot size={14} color="var(--accent)" />
    </div>
  );
}

function UserAvatar({ foto, nombre }) {
  const iniciales = nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
      background: foto ? 'none' : 'linear-gradient(135deg, var(--accent), #8B5CF6)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10, fontWeight: 700, color: 'white'
    }}>
      {foto
        ? <img src={foto} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : iniciales
      }
    </div>
  );
}

function MensajeBurbuja({ msg, foto, nombre }) {
  const esBot = msg.rol === 'assistant';

  const lines = msg.texto.split('\n');
  const formateado = lines.map((line, i) => {
    const partes = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <React.Fragment key={i}>
        {partes.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j}>{p.slice(2, -2)}</strong>
            : p
        )}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'flex-end',
      flexDirection: esBot ? 'row' : 'row-reverse'
    }}>
      {esBot ? <BotAvatar /> : <UserAvatar foto={foto} nombre={nombre} />}

      <div style={{
        maxWidth: '78%',
        padding: '10px 13px',
        background: esBot ? 'var(--bg-main)' : 'var(--accent)',
        border: esBot ? '1px solid var(--border)' : 'none',
        borderRadius: esBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        fontSize: 13, lineHeight: 1.6,
        color: esBot ? 'var(--text-primary)' : 'white'
      }}>
        {formateado}
      </div>
    </div>
  );
}
