// =============================================
// CandidatosList.jsx — Lista de candidatos del día
// Mismo patrón de cards expandibles que TicketList
// =============================================

import React, { useState } from 'react';
import { Star, Clock, ChevronDown, ChevronUp } from 'lucide-react';

// Datos fijos de los 8 candidatos de hoy
const CANDIDATOS = [
  {
    id: 1,
    nombre: 'José Fernández Ruiz',
    puesto: 'Oficial 1ª Albañilería',
    puntuacion: 92,
    estado: 'encaja',
    motivo: '12 años de experiencia en albañilería, disponibilidad inmediata, referencias excelentes de obras similares.',
    siguiente: 'Entrevista jueves 3 julio a las 10:00h con Pedro Ruiz (Jefe de Obra)',
    hora: '08:32'
  },
  {
    id: 2,
    nombre: 'Carlos Peña Martínez',
    puesto: 'Encargado de Obra',
    puntuacion: 88,
    estado: 'encaja',
    motivo: '15 años de experiencia, perfil senior ideal para la obra de Serrano. Ha dirigido obras de hasta 800k€.',
    siguiente: 'Escalado a dirección para entrevista directa con Carlos Meridiano',
    hora: '09:15'
  },
  {
    id: 3,
    nombre: 'Andrés Moreno López',
    puesto: 'Oficial 2ª Albañilería',
    puntuacion: 61,
    estado: 'posible',
    motivo: 'Poca experiencia (3 años) pero pretensión salarial ajustada y buenas referencias del último empleador.',
    siguiente: 'Segunda revisión pendiente — comparar con otros perfiles antes de decidir',
    hora: '10:44'
  },
  {
    id: 4,
    nombre: 'Laura Gómez Sánchez',
    puesto: 'Administrativa',
    puntuacion: 58,
    estado: 'posible',
    motivo: 'No es el perfil que se busca ahora, pero encajaría bien si se abre vacante administrativa en otoño.',
    siguiente: 'Archivar para futura vacante de administración',
    hora: '11:20'
  },
  {
    id: 5,
    nombre: 'María Rodríguez',
    puesto: 'Peón de obra',
    puntuacion: 18,
    estado: 'no_encaja',
    motivo: 'Sin experiencia en construcción. No cumple el requisito mínimo de 1 año en obra exigido por el puesto.',
    siguiente: 'Email de rechazo enviado ✅',
    hora: '09:50'
  },
  {
    id: 6,
    nombre: 'Roberto Vega',
    puesto: 'Oficial 1ª Albañilería',
    puntuacion: 22,
    estado: 'no_encaja',
    motivo: 'Pretensión salarial de 52.000€ brutos anuales, fuera del rango presupuestario (máximo 36.000€).',
    siguiente: 'Email de rechazo enviado ✅',
    hora: '10:10'
  },
  {
    id: 7,
    nombre: 'Ana Martínez',
    puesto: 'Administrativa',
    puntuacion: 15,
    estado: 'no_encaja',
    motivo: 'Busca exclusivamente trabajo de oficina. No está dispuesta a visitar obras ni desplazarse a otros municipios.',
    siguiente: 'Email de rechazo enviado ✅',
    hora: '11:05'
  },
  {
    id: 8,
    nombre: 'Pablo Torres',
    puesto: 'Peón de obra',
    puntuacion: 20,
    estado: 'no_encaja',
    motivo: 'No tiene carnet de conducir. El puesto requiere desplazamiento a diferentes obras en toda la Comunidad de Madrid.',
    siguiente: 'Email de rechazo enviado ✅',
    hora: '12:30'
  }
];

const CONFIG_ESTADO = {
  encaja:     { label: 'ENCAJA',    badgeClass: 'badge-green'  },
  posible:    { label: 'POSIBLE',   badgeClass: 'badge-yellow' },
  no_encaja:  { label: 'NO ENCAJA', badgeClass: 'badge-red'   }
};

// Color de avatar según posición (igual que clientes en el original)
const COLORES_AVATAR = [
  'linear-gradient(135deg, #6366F1, #8B5CF6)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #EF4444, #DC2626)',
  'linear-gradient(135deg, #3B82F6, #2563EB)',
  'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'linear-gradient(135deg, #EC4899, #DB2777)',
  'linear-gradient(135deg, #14B8A6, #0D9488)'
];

export default function CandidatosList() {
  const [expandido, setExpandido] = useState(null);
  const [filtro, setFiltro] = useState('todos');

  const conteos = {
    todos:     CANDIDATOS.length,
    encaja:    CANDIDATOS.filter(c => c.estado === 'encaja').length,
    posible:   CANDIDATOS.filter(c => c.estado === 'posible').length,
    no_encaja: CANDIDATOS.filter(c => c.estado === 'no_encaja').length
  };

  const candidatosFiltrados = filtro === 'todos'
    ? CANDIDATOS
    : CANDIDATOS.filter(c => c.estado === filtro);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>

      {/* Cabecera */}
      <div>
        <h2 style={{ fontWeight: 600, fontSize: 16 }}>Candidatos de hoy</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
          {CANDIDATOS.length} CVs procesados · {conteos.encaja} encajan con el perfil
        </p>
      </div>

      {/* Filtros de estado — mismo estilo que tickets */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { key: 'todos',     label: 'Todos'       },
          { key: 'encaja',    label: 'Encajan'     },
          { key: 'posible',   label: 'Posibles'    },
          { key: 'no_encaja', label: 'No encajan'  }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              background: filtro === f.key ? 'var(--accent)' : 'var(--border)',
              color: filtro === f.key ? 'white' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {f.label}
            <span style={{ marginLeft: 5, opacity: 0.7 }}>{conteos[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Lista scrollable */}
      <div className="scrollable" style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {candidatosFiltrados.map((c, idx) => (
            <CandidatoCard
              key={c.id}
              candidato={c}
              colorAvatar={COLORES_AVATAR[c.id - 1]}
              expandido={expandido === c.id}
              onToggle={() => setExpandido(prev => prev === c.id ? null : c.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Card individual de candidato ----

function CandidatoCard({ candidato, colorAvatar, expandido, onToggle }) {
  const cfg = CONFIG_ESTADO[candidato.estado];
  const iniciales = candidato.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="animate-fadein" style={{
      background: 'var(--bg-card)',
      border: `1px solid ${expandido ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'border-color 0.2s'
    }}>
      {/* Fila principal */}
      <div
        onClick={onToggle}
        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
      >
        {/* Avatar con iniciales */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: colorAvatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'white',
          letterSpacing: '0.5px'
        }}>
          {iniciales}
        </div>

        {/* Nombre + puesto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>{candidato.nombre}</p>
            <span className={`badge ${cfg.badgeClass}`} style={{ flexShrink: 0 }}>{cfg.label}</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{candidato.puesto}</p>
        </div>

        {/* Puntuación + hora */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--bg-main)', padding: '3px 8px',
            borderRadius: 12, border: '1px solid var(--border)'
          }}>
            <Star size={10} color="var(--yellow)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {candidato.puntuacion}/100
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <Clock size={10} />
            {candidato.hora}
          </div>
        </div>

        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 16px',
          background: 'var(--bg-main)',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          <DetalleItem label="Evaluación IA" valor={candidato.motivo} />
          <DetalleItem
            label="Siguiente paso"
            valor={candidato.siguiente}
            destacado
          />
        </div>
      )}
    </div>
  );
}

function DetalleItem({ label, valor, destacado }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <p style={{
        fontSize: 13, lineHeight: 1.6,
        color: destacado ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: destacado ? 500 : 400
      }}>
        {valor}
      </p>
    </div>
  );
}
