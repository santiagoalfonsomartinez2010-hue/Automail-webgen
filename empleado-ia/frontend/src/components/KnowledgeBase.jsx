// =============================================
// KnowledgeBase.jsx - Base de conocimiento
// Muestra los datos cacheados de Google Sheets
// =============================================

import React, { useState, useEffect } from 'react';
import {
  RefreshCw, HelpCircle, Package, FileText,
  Star, Clock, Database, ChevronDown, ChevronUp
} from 'lucide-react';
import { useApp } from '../App.jsx';

const SECCIONES = [
  { id: 'FAQs', label: 'FAQs', icono: HelpCircle, color: 'var(--blue)' },
  { id: 'Productos', label: 'Productos', icono: Package, color: 'var(--green)' },
  { id: 'Políticas', label: 'Políticas', icono: FileText, color: 'var(--yellow)' },
  { id: 'Clientes_VIP', label: 'Clientes VIP', icono: Star, color: 'var(--accent)' }
];

export default function KnowledgeBase() {
  const { agregarNotificacion } = useApp();
  const [cache, setCache] = useState({});
  const [cargando, setCargando] = useState(true);
  const [sincronizando, setSincronizando] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('FAQs');

  useEffect(() => {
    cargarCache();
  }, []);

  async function cargarCache() {
    setCargando(true);
    try {
      const res = await fetch('/api/conocimiento');
      const datos = await res.json();
      setCache(datos);
    } catch (error) {
      agregarNotificacion('Error cargando base de conocimiento', 'error');
    } finally {
      setCargando(false);
    }
  }

  async function sincronizar() {
    setSincronizando(true);
    try {
      const res = await fetch('/api/sheets/sincronizar', { method: 'POST' });
      const datos = await res.json();
      if (datos.ok) {
        await cargarCache();
        agregarNotificacion('Base de conocimiento sincronizada', 'success');
      }
    } catch (error) {
      agregarNotificacion('Error al sincronizar', 'error');
    } finally {
      setSincronizando(false);
    }
  }

  const seccionData = cache[seccionActiva];
  const ultimaSync = seccionData?.ultima_sync;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: 16 }}>Base de conocimiento</h2>
          {ultimaSync && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <Clock size={11} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                Última sync: {new Date(ultimaSync).toLocaleString('es-ES', {
                  hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short'
                })}
              </p>
            </div>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={sincronizar}
          disabled={sincronizando}
          title="Sincronizar con Google Sheets"
        >
          <RefreshCw size={14} className={sincronizando ? 'animate-spin' : ''} />
          {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {/* Tabs de secciones */}
      <div style={{ display: 'flex', gap: 6 }}>
        {SECCIONES.map(seccion => {
          const Icono = seccion.icono;
          const cantidad = cache[seccion.id]?.datos?.length || 0;
          const activa = seccionActiva === seccion.id;
          return (
            <button
              key={seccion.id}
              onClick={() => setSeccionActiva(seccion.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                background: activa ? seccion.color + '20' : 'var(--border)',
                border: `1px solid ${activa ? seccion.color : 'transparent'}`,
                borderRadius: 'var(--radius-sm)',
                color: activa ? seccion.color : 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icono size={13} />
              {seccion.label}
              <span style={{
                background: activa ? seccion.color : 'var(--text-muted)',
                color: 'white',
                borderRadius: 10,
                padding: '1px 6px',
                fontSize: 10,
                fontWeight: 700
              }}>
                {cantidad}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="scrollable" style={{ flex: 1 }}>
        {cargando ? (
          <div className="empty-state">
            <RefreshCw size={32} className="animate-spin" />
            <p>Cargando datos...</p>
          </div>
        ) : !seccionData?.datos?.length ? (
          <div className="empty-state">
            <Database size={48} />
            <p style={{ fontWeight: 500 }}>Sin datos en {seccionActiva}</p>
            <p style={{ fontSize: 12 }}>
              Pulsa "Sincronizar" para cargar datos del Google Sheet
            </p>
          </div>
        ) : seccionActiva === 'FAQs' ? (
          <FAQsList items={seccionData.datos} />
        ) : seccionActiva === 'Productos' ? (
          <ProductosList items={seccionData.datos} />
        ) : seccionActiva === 'Políticas' ? (
          <PoliticasList items={seccionData.datos} />
        ) : (
          <VIPList items={seccionData.datos} />
        )}
      </div>
    </div>
  );
}

// ---- Componentes por tipo ----

function FAQsList({ items }) {
  const [expandido, setExpandido] = useState(null);
  const categorias = [...new Set(items.map(f => f.Categoría).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {categorias.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          {categorias.map(cat => (
            <span key={cat} className="badge badge-blue" style={{ fontSize: 10 }}>{cat}</span>
          ))}
        </div>
      )}
      {items.map((faq, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden'
        }}>
          <div
            onClick={() => setExpandido(expandido === i ? null : i)}
            style={{
              padding: '11px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <HelpCircle size={14} color="var(--blue)" style={{ flexShrink: 0 }} />
            <p style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{faq.Pregunta}</p>
            {faq.Categoría && (
              <span className="badge badge-gray" style={{ fontSize: 10, flexShrink: 0 }}>
                {faq.Categoría}
              </span>
            )}
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              {expandido === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </div>
          {expandido === i && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '10px 14px 10px 38px',
              background: 'var(--bg-main)',
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              {faq.Respuesta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ProductosList({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
      {items.map((producto, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <p style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{producto.Nombre}</p>
            <span style={{
              background: 'var(--green-light)',
              color: 'var(--green)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              marginLeft: 8
            }}>
              {producto.Precio}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {producto.Descripción}
          </p>
        </div>
      ))}
    </div>
  );
}

function PoliticasList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((politica, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <FileText size={14} color="var(--yellow)" />
            <p style={{ fontWeight: 600, fontSize: 13, color: 'var(--yellow)' }}>
              {politica.Tema}
            </p>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {politica.Descripción}
          </p>
        </div>
      ))}
    </div>
  );
}

function VIPList({ items }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <Star size={48} />
        <p style={{ fontWeight: 500 }}>Sin clientes VIP configurados</p>
        <p style={{ fontSize: 12 }}>
          Añade clientes en la pestaña "Clientes_VIP" de tu Google Sheet
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((vip, i) => (
        <div key={i} style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Star size={14} color="var(--accent)" />
            <p style={{ fontWeight: 600, fontSize: 13 }}>{vip.Nombre}</p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            {vip.Email}
          </p>
          {vip.Instrucciones_especiales && (
            <div style={{
              padding: '8px 10px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.5
            }}>
              {vip.Instrucciones_especiales}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
