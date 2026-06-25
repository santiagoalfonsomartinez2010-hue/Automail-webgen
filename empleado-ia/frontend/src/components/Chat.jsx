// =============================================
// Chat.jsx - Chat en tiempo real con la empleada IA
// El empresario puede hablar directamente con ella
// =============================================

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User, RefreshCw } from 'lucide-react';
import { useApp } from '../App.jsx';
import { getChatHistorial, postChat } from '../api.js';

export default function Chat() {
  const { config, agregarNotificacion } = useApp();
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    cargarHistorial();
  }, []);

  useEffect(() => {
    scrollAlFinal();
  }, [mensajes]);

  async function cargarHistorial() {
    setCargandoHistorial(true);
    try {
      const datos = await getChatHistorial();
      if (datos && datos.length > 0) {
        setMensajes(datos.map(m => ({
          id: m.id,
          rol: m.rol,
          contenido: m.contenido,
          fecha: m.fecha
        })));
      } else {
        setMensajes([{
          id: 'bienvenida',
          rol: 'empleada',
          contenido: `¡Hola! Soy ${config?.nombre_empleada || 'Sofía'}, tu empleada de atención al cliente 👋\n\nEstoy aquí para ayudarte. Puedes preguntarme sobre los tickets que he gestionado hoy, darme nuevas instrucciones, o simplemente preguntarme cómo va el día.\n\n¿En qué te puedo ayudar?`,
          fecha: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setCargandoHistorial(false);
    }
  }

  function scrollAlFinal() {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function enviarMensaje(e) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || enviando) return;

    setInput('');

    // Añadir mensaje del usuario inmediatamente
    const mensajeUsuario = {
      id: 'temp_' + Date.now(),
      rol: 'usuario',
      contenido: texto,
      fecha: new Date().toISOString()
    };
    setMensajes(prev => [...prev, mensajeUsuario]);

    // Indicador de "escribiendo"
    const escribiendoId = 'escribiendo_' + Date.now();
    setMensajes(prev => [...prev, {
      id: escribiendoId,
      rol: 'empleada',
      contenido: null,
      fecha: new Date().toISOString(),
      escribiendo: true
    }]);

    setEnviando(true);
    try {
      const datos = await postChat(texto);
      setMensajes(prev => [
        ...prev.filter(m => m.id !== escribiendoId),
        {
          id: 'resp_' + Date.now(),
          rol: 'empleada',
          contenido: datos.respuesta,
          fecha: datos.fecha || new Date().toISOString()
        }
      ]);
    } catch (error) {
      setMensajes(prev => prev.filter(m => m.id !== escribiendoId));
      agregarNotificacion('Error al enviar mensaje', 'error');
    } finally {
      setEnviando(false);
      inputRef.current?.focus();
    }
  }

  const nombre = config?.nombre_empleada || 'Sofía';
  const fotoUrl = config?.foto_url;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border)'
    }}>
      {/* Cabecera del chat */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0
      }}>
        {/* Avatar pequeño */}
        <div style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: fotoUrl ? 'none' : 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)',
          border: '2px solid var(--border)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {fotoUrl
            ? <img src={fotoUrl} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Bot size={18} color="white" />
          }
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{nombre}</p>
          <p style={{ color: 'var(--green)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              display: 'inline-block',
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            En línea
          </p>
        </div>

        <button
          className="btn btn-ghost"
          onClick={cargarHistorial}
          title="Recargar historial"
          style={{ padding: '6px', minWidth: 'auto' }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Lista de mensajes */}
      <div
        className="scrollable"
        style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto'
        }}
      >
        {cargandoHistorial ? (
          <div className="empty-state">
            <Loader2 size={24} className="animate-spin" />
            <p style={{ fontSize: 13 }}>Cargando conversación...</p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="empty-state">
            <Bot size={40} />
            <p style={{ fontSize: 13 }}>Empieza la conversación</p>
          </div>
        ) : (
          mensajes.map(mensaje => (
            <Mensaje
              key={mensaje.id}
              mensaje={mensaje}
              nombre={nombre}
              fotoUrl={fotoUrl}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Sugerencias rápidas */}
      {mensajes.length <= 1 && (
        <div style={{
          padding: '0 16px 12px',
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap'
        }}>
          {[
            '¿Cómo va el día hoy?',
            '¿Hay tickets urgentes?',
            '¿Qué emails has respondido?',
            'Dime los tickets escalados'
          ].map(sugerencia => (
            <button
              key={sugerencia}
              onClick={() => {
                setInput(sugerencia);
                inputRef.current?.focus();
              }}
              style={{
                padding: '5px 10px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.color = 'var(--accent)';
              }}
              onMouseLeave={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              {sugerencia}
            </button>
          ))}
        </div>
      )}

      {/* Input del chat */}
      <form
        onSubmit={enviarMensaje}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 8,
          flexShrink: 0
        }}
      >
        <input
          ref={inputRef}
          className="input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Escribe a ${nombre}...`}
          disabled={enviando}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!input.trim() || enviando}
          style={{ padding: '8px 12px', minWidth: 'auto' }}
        >
          {enviando
            ? <Loader2 size={15} className="animate-spin" />
            : <Send size={15} />
          }
        </button>
      </form>
    </div>
  );
}

// ---- Burbuja de mensaje ----

function Mensaje({ mensaje, nombre, fotoUrl }) {
  const esEmpleada = mensaje.rol === 'empleada';
  const hora = new Date(mensaje.fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  });

  if (mensaje.escribiendo) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <AvatarMini esEmpleada={true} fotoUrl={fotoUrl} />
        <div style={{
          padding: '10px 14px',
          background: 'var(--bg-main)',
          border: '1px solid var(--border)',
          borderRadius: '12px 12px 12px 2px',
          display: 'flex',
          gap: 4,
          alignItems: 'center'
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'var(--text-muted)',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fadein"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        flexDirection: esEmpleada ? 'row' : 'row-reverse'
      }}
    >
      <AvatarMini esEmpleada={esEmpleada} fotoUrl={fotoUrl} />

      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <div style={{
          padding: '10px 14px',
          background: esEmpleada ? 'var(--bg-main)' : 'var(--accent)',
          border: esEmpleada ? '1px solid var(--border)' : 'none',
          borderRadius: esEmpleada ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
          fontSize: 13,
          lineHeight: 1.6,
          color: esEmpleada ? 'var(--text-primary)' : 'white',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {mensaje.contenido}
        </div>
        <p style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          textAlign: esEmpleada ? 'left' : 'right',
          paddingInline: 4
        }}>
          {hora}
        </p>
      </div>
    </div>
  );
}

function AvatarMini({ esEmpleada, fotoUrl }) {
  return (
    <div style={{
      width: 28, height: 28,
      borderRadius: '50%',
      background: esEmpleada
        ? (fotoUrl ? 'none' : 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)')
        : 'var(--bg-main)',
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {esEmpleada
        ? (fotoUrl
          ? <img src={fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <Bot size={14} color="white" />
        )
        : <User size={14} color="var(--text-secondary)" />
      }
    </div>
  );
}
