// =============================================
// Onboarding.jsx - Wizard de configuración inicial
// 5 pasos para configurar al empleado IA
// =============================================

import React, { useState, useRef } from 'react';
import {
  User, Building2, Table2, AlertTriangle, Mail,
  CheckCircle, ArrowRight, ArrowLeft, Upload, Check,
  Loader2, XCircle, Bot, Sparkles
} from 'lucide-react';
import { useApp } from '../App.jsx';

const PASOS = [
  { id: 1, icono: User, titulo: 'Tu empleada', desc: 'Nombre y foto' },
  { id: 2, icono: Building2, titulo: 'Tu empresa', desc: 'Datos y tono' },
  { id: 3, icono: Table2, titulo: 'Google Sheets', desc: 'Base de conocimiento' },
  { id: 4, icono: AlertTriangle, titulo: 'Escalado', desc: 'Reglas y límites' },
  { id: 5, icono: Mail, titulo: 'Gmail', desc: 'Conectar email' }
];

export default function Onboarding({ onCompleto }) {
  const { actualizarConfig, agregarNotificacion } = useApp();
  const [pasoActual, setPasoActual] = useState(1);
  const [guardando, setGuardando] = useState(false);

  // Datos del formulario
  const [datos, setDatos] = useState({
    nombre_empleada: 'Sofía',
    foto_url: null,
    empresa: '',
    tono: 'neutro',
    sheet_id: '',
    reglas_escalado: JSON.stringify({
      importeMaximo: 200,
      categorias: ['legal', 'fraude', 'tecnico_avanzado'],
      palabrasClave: ['abogado', 'denuncia', 'robo', 'fraude']
    })
  });

  const [sheetsVerificado, setSheetsVerificado] = useState(false);
  const [sheetsVerificando, setSheetsVerificando] = useState(false);
  const [sheetsError, setSheetsError] = useState(null);

  function actualizarDato(campo, valor) {
    setDatos(prev => ({ ...prev, [campo]: valor }));
  }

  async function guardarPaso(pasoNum) {
    setGuardando(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    } catch (error) {
      agregarNotificacion('Error al guardar: ' + error.message, 'error');
    } finally {
      setGuardando(false);
    }
  }

  async function avanzar() {
    await guardarPaso(pasoActual);
    if (pasoActual < 5) {
      setPasoActual(p => p + 1);
    }
  }

  async function completar() {
    setGuardando(true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      await fetch('/api/onboarding/completar', { method: 'POST' });
      actualizarConfig({ ...datos, onboarding_completado: 1 });
      onCompleto();
    } catch (error) {
      agregarNotificacion('Error al completar el onboarding', 'error');
    } finally {
      setGuardando(false);
    }
  }

  const progreso = ((pasoActual - 1) / (PASOS.length - 1)) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Cabecera */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--accent-light)',
            border: '1px solid var(--accent)',
            borderRadius: 30,
            padding: '8px 20px',
            marginBottom: 20
          }}>
            <Bot size={18} color="var(--accent)" />
            <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>
              Empleado IA
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Configura a tu empleada de IA
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            En 5 minutos tendrás a tu asistente trabajando
          </p>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {PASOS.map(paso => {
            const activo = paso.id === pasoActual;
            const completado = paso.id < pasoActual;
            return (
              <div
                key={paso.id}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: completado || activo ? 'var(--accent)' : 'var(--border)',
                  opacity: completado ? 0.6 : 1,
                  transition: 'all 0.3s'
                }}
              />
            );
          })}
        </div>

        {/* Número de paso */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24
        }}>
          {(() => {
            const paso = PASOS[pasoActual - 1];
            const Icono = paso.icono;
            return (
              <>
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icono size={20} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Paso {pasoActual} de {PASOS.length}
                  </p>
                  <h2 style={{ fontWeight: 600, fontSize: 18 }}>
                    {paso.titulo} — {paso.desc}
                  </h2>
                </div>
              </>
            );
          })()}
        </div>

        {/* Contenido del paso */}
        <div className="card animate-fadein" style={{ padding: 28, marginBottom: 20 }}>
          {pasoActual === 1 && (
            <Paso1
              datos={datos}
              onChange={actualizarDato}
            />
          )}
          {pasoActual === 2 && (
            <Paso2
              datos={datos}
              onChange={actualizarDato}
            />
          )}
          {pasoActual === 3 && (
            <Paso3
              datos={datos}
              onChange={actualizarDato}
              verificado={sheetsVerificado}
              verificando={sheetsVerificando}
              error={sheetsError}
              onVerificar={async () => {
                setSheetsVerificando(true);
                setSheetsError(null);
                try {
                  const res = await fetch('/api/sheets/verificar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sheet_id: datos.sheet_id })
                  });
                  const resultado = await res.json();
                  if (resultado.ok) {
                    setSheetsVerificado(true);
                    agregarNotificacion('Google Sheets conectado correctamente', 'success');
                  } else {
                    setSheetsError(resultado.error || 'No se pudo conectar al Sheet');
                  }
                } catch {
                  setSheetsError('Error de conexión');
                } finally {
                  setSheetsVerificando(false);
                }
              }}
            />
          )}
          {pasoActual === 4 && (
            <Paso4
              datos={datos}
              onChange={actualizarDato}
            />
          )}
          {pasoActual === 5 && (
            <Paso5 />
          )}
        </div>

        {/* Botones de navegación */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          {pasoActual > 1 ? (
            <button
              className="btn btn-ghost"
              onClick={() => setPasoActual(p => p - 1)}
            >
              <ArrowLeft size={16} />
              Anterior
            </button>
          ) : <div />}

          {pasoActual < 5 ? (
            <button
              className="btn btn-primary"
              onClick={avanzar}
              disabled={guardando || (pasoActual === 1 && !datos.nombre_empleada)}
            >
              {guardando ? <Loader2 size={16} className="animate-spin" /> : null}
              Continuar
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={completar}
              disabled={guardando}
              style={{ gap: 8 }}
            >
              {guardando
                ? <Loader2 size={16} className="animate-spin" />
                : <Sparkles size={16} />
              }
              {guardando ? 'Iniciando...' : '¡Empezar a trabajar!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- PASO 1: Nombre y foto ----

function Paso1({ datos, onChange }) {
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);

  async function manejarFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendo(true);
    const formData = new FormData();
    formData.append('foto', archivo);

    try {
      const res = await fetch('/api/config/foto', { method: 'POST', body: formData });
      const datos_res = await res.json();
      onChange('foto_url', datos_res.foto_url);
    } catch (error) {
      console.error('Error subiendo foto:', error);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            width: 88, height: 88,
            borderRadius: '50%',
            background: datos.foto_url ? 'none' : 'var(--accent-light)',
            border: `2px dashed ${datos.foto_url ? 'var(--green)' : 'var(--accent)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {subiendo ? (
            <Loader2 size={24} color="var(--accent)" className="animate-spin" />
          ) : datos.foto_url ? (
            <img
              src={datos.foto_url}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Upload size={24} color="var(--accent)" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={manejarFoto}
          />
        </div>
        <div>
          <p style={{ fontWeight: 500, marginBottom: 4 }}>Foto de perfil</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            JPEG, PNG o WebP. Máx 5MB.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
            Si no subes foto, se usará un avatar generado.
          </p>
        </div>
      </div>

      {/* Nombre */}
      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Nombre de tu empleada IA *
        </label>
        <input
          className="input"
          type="text"
          value={datos.nombre_empleada}
          onChange={e => onChange('nombre_empleada', e.target.value)}
          placeholder="Ej: Sofía, Elena, Laura..."
          maxLength={30}
        />
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
          Este nombre aparecerá en las respuestas a los clientes y en el dashboard.
        </p>
      </div>
    </div>
  );
}

// ---- PASO 2: Empresa y tono ----

function Paso2({ datos, onChange }) {
  const tonos = [
    { valor: 'formal', label: 'Formal', desc: 'Profesional y respetuoso. Ideal para sectores legales, financieros o premium.' },
    { valor: 'neutro', label: 'Neutro', desc: 'Equilibrado y claro. Funciona en la mayoría de negocios.' },
    { valor: 'cercano', label: 'Cercano', desc: 'Amigable y conversacional. Ideal para comercio, hostelería o moda.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Nombre de tu empresa *
        </label>
        <input
          className="input"
          type="text"
          value={datos.empresa}
          onChange={e => onChange('empresa', e.target.value)}
          placeholder="Ej: Ferreterías López, Clínica Dental Pérez..."
          maxLength={60}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 12, fontWeight: 500 }}>
          Tono de comunicación
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tonos.map(tono => (
            <label
              key={tono.valor}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 14,
                border: `1px solid ${datos.tono === tono.valor ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                background: datos.tono === tono.valor ? 'var(--accent-light)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="radio"
                name="tono"
                value={tono.valor}
                checked={datos.tono === tono.valor}
                onChange={e => onChange('tono', e.target.value)}
                style={{ marginTop: 2 }}
              />
              <div>
                <p style={{ fontWeight: 500, marginBottom: 2 }}>{tono.label}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{tono.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- PASO 3: Google Sheets ----

function Paso3({ datos, onChange, verificado, verificando, error, onVerificar }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{
        padding: 14,
        background: 'var(--accent-light)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 13,
        color: 'var(--text-secondary)',
        lineHeight: 1.6
      }}>
        <p style={{ fontWeight: 600, color: 'var(--accent)', marginBottom: 6 }}>
          ¿Cómo preparar tu Google Sheet?
        </p>
        <p>Crea un Google Sheet con estas pestañas:</p>
        <ul style={{ marginLeft: 16, marginTop: 4, color: 'var(--text-muted)' }}>
          <li><strong style={{ color: 'var(--text-secondary)' }}>FAQs</strong>: Pregunta | Respuesta | Categoría</li>
          <li><strong style={{ color: 'var(--text-secondary)' }}>Productos</strong>: Nombre | Precio | Descripción</li>
          <li><strong style={{ color: 'var(--text-secondary)' }}>Políticas</strong>: Tema | Descripción</li>
          <li><strong style={{ color: 'var(--text-secondary)' }}>Clientes_VIP</strong>: Email | Nombre | Instrucciones_especiales</li>
        </ul>
        <p style={{ marginTop: 6 }}>Luego comparte el Sheet con acceso de lectura.</p>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          ID del Google Sheet
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            type="text"
            value={datos.sheet_id}
            onChange={e => onChange('sheet_id', e.target.value)}
            placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OlbCVtbZg"
            style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
          />
          <button
            className="btn btn-secondary"
            onClick={onVerificar}
            disabled={!datos.sheet_id || verificando}
            style={{ flexShrink: 0 }}
          >
            {verificando
              ? <Loader2 size={15} className="animate-spin" />
              : verificado
                ? <CheckCircle size={15} color="var(--green)" />
                : 'Verificar'
            }
          </button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
          Lo encuentras en la URL: docs.google.com/spreadsheets/d/<strong>ESTE_ID</strong>/edit
        </p>
      </div>

      {verificado && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'var(--green-light)',
          border: '1px solid var(--green)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--green)', fontSize: 13, fontWeight: 500
        }}>
          <CheckCircle size={16} />
          Sheet verificado correctamente. Las pestañas han sido encontradas.
        </div>
      )}

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'var(--red-light)',
          border: '1px solid var(--red)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--red)', fontSize: 13
        }}>
          <XCircle size={16} />
          {error}
        </div>
      )}

      <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        En modo desarrollo, los datos de Ferreterías López se cargan automáticamente aunque no configures el Sheet.
      </p>
    </div>
  );
}

// ---- PASO 4: Reglas de escalado ----

function Paso4({ datos, onChange }) {
  const reglas = (() => {
    try {
      return JSON.parse(datos.reglas_escalado);
    } catch {
      return { importeMaximo: 200, categorias: [], palabrasClave: [] };
    }
  })();

  function actualizarReglas(campo, valor) {
    onChange('reglas_escalado', JSON.stringify({ ...reglas, [campo]: valor }));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
        Define cuándo el empleado IA debe escalar un ticket a ti en lugar de responder solo.
      </p>

      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Importe máximo a gestionar (€)
        </label>
        <input
          className="input"
          type="number"
          value={reglas.importeMaximo}
          onChange={e => actualizarReglas('importeMaximo', parseInt(e.target.value))}
          min={0}
          style={{ maxWidth: 200 }}
        />
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
          Tickets con importes superiores se escalarán automáticamente.
        </p>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Categorías que siempre escalar
        </label>
        <input
          className="input"
          type="text"
          value={reglas.categorias?.join(', ') || ''}
          onChange={e => actualizarReglas('categorias', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="legal, fraude, tecnico_avanzado"
        />
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
          Separadas por comas.
        </p>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Palabras clave que activan escalado
        </label>
        <input
          className="input"
          type="text"
          value={reglas.palabrasClave?.join(', ') || ''}
          onChange={e => actualizarReglas('palabrasClave', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="abogado, denuncia, robo, fraude"
        />
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>
          Si aparecen en el email, se escalará automáticamente.
        </p>
      </div>
    </div>
  );
}

// ---- PASO 5: Gmail ----

function Paso5() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80,
        background: 'var(--yellow-light)',
        border: '1px solid var(--yellow)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto'
      }}>
        <Mail size={36} color="var(--yellow)" />
      </div>

      <div>
        <h3 style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
          Conectar Gmail — Próximamente
        </h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
          La integración con Gmail OAuth2 está lista en el backend pero se activará en la siguiente fase.
        </p>
        <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 13 }}>
          Por ahora tu empleada trabajará con los <strong style={{ color: 'var(--text-secondary)' }}>8 emails simulados</strong> de
          Ferreterías López para que puedas ver cómo funciona el sistema.
        </p>
      </div>

      <div style={{
        padding: 16,
        background: 'var(--bg-main)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'left'
      }}>
        <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 13 }}>
          Cuando conectes Gmail, tu empleada podrá:
        </p>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Leer emails nuevos automáticamente cada 5 minutos',
            'Responder directamente en nombre de la empresa',
            'Mantener el hilo de conversación con cada cliente',
            'Marcar como leídos los emails ya gestionados'
          ].map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)', fontSize: 13 }}>
              <Check size={14} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
        Puedes continuar sin conectar Gmail y conectarlo más tarde desde el panel.
      </p>
    </div>
  );
}
