// =============================================
// EquipoList.jsx — Lista del equipo completo
// Mismo patrón de cards que ClientList
// =============================================

import React, { useState } from 'react';
import {
  Search, AlertTriangle,
  ChevronDown, ChevronUp, Briefcase
} from 'lucide-react';

// 17 empleados: 14 trabajando + 2 vacaciones + 1 baja
const EQUIPO = [
  { id: 1,  nombre: 'Carlos Meridiano',  cargo: 'Fundador y Director',      obra: null,        estado: 'trabajando', contrato: 'Indefinido',            alertaContrato: false },
  { id: 2,  nombre: 'Laura Sánchez',     cargo: 'Administración',            obra: null,        estado: 'trabajando', contrato: 'Indefinido',            alertaContrato: false },
  { id: 3,  nombre: 'Pedro Ruiz',        cargo: 'Jefe de Obra',              obra: 'Ático',     estado: 'trabajando', contrato: 'Indefinido',            alertaContrato: false },
  { id: 4,  nombre: 'Antonio Vega',      cargo: 'Jefe de Obra',              obra: 'Chamberí',  estado: 'trabajando', contrato: 'Indefinido',            alertaContrato: false },
  {
    id: 5,  nombre: 'José Fernández',    cargo: 'Oficial 1ª Albañilería',    obra: 'Ático',     estado: 'trabajando',
    contrato: 'Obra · Vence 31 julio',   alertaContrato: true,
    alertaMsg: '⚠️ Contrato vence en 4 días (31 julio)'
  },
  { id: 6,  nombre: 'Manuel Torres',     cargo: 'Oficial 1ª Azulejista',     obra: 'Ático',     estado: 'trabajando', contrato: 'Obra · Vence 15 agosto',   alertaContrato: false },
  {
    id: 7,  nombre: 'David García',      cargo: 'Oficial 2ª Albañilería',    obra: null,        estado: 'vacaciones',
    contrato: 'Indefinido',              alertaContrato: false,
    nota: 'Vacaciones hasta 30 junio · Vuelve el lunes → pendiente reasignar a obra Serrano'
  },
  { id: 8,  nombre: 'Roberto Sanz',      cargo: 'Peón',                      obra: 'Chamberí',  estado: 'trabajando', contrato: 'Obra · Vence 31 agosto',   alertaContrato: false },
  {
    id: 9,  nombre: 'Miguel Herrero',    cargo: 'Oficial 1ª Pintura',        obra: null,        estado: 'baja',
    contrato: 'Indefinido',              alertaContrato: false,
    nota: 'Baja médica desde 20 junio · Día 7 de baja · Sin fecha estimada de regreso'
  },
  { id: 10, nombre: 'Francisco López',   cargo: 'Peón',                      obra: 'Chamberí',  estado: 'trabajando', contrato: 'Obra · Vence 30 septiembre', alertaContrato: false },
  { id: 11, nombre: 'Javier Moreno',     cargo: 'Oficial 1ª Electricidad',   obra: 'Serrano',   estado: 'trabajando', contrato: 'Obra · Vence 31 agosto',    alertaContrato: false },
  { id: 12, nombre: 'Sergio Castillo',   cargo: 'Oficial 1ª Fontanería',     obra: 'Chamberí',  estado: 'trabajando', contrato: 'Obra · Vence 30 septiembre', alertaContrato: false },
  { id: 13, nombre: 'Raúl Delgado',      cargo: 'Peón',                      obra: 'Ático',     estado: 'trabajando', contrato: 'Obra · Vence 15 agosto',    alertaContrato: false },
  { id: 14, nombre: 'Iván Santos',       cargo: 'Oficial 2ª Albañilería',    obra: 'Ático',     estado: 'trabajando', contrato: 'Obra · Vence 31 agosto',    alertaContrato: false },
  { id: 15, nombre: 'Óscar Navarro',     cargo: 'Oficial 1ª Escayolista',    obra: 'Serrano',   estado: 'trabajando', contrato: 'Obra · Vence 30 septiembre', alertaContrato: false },
  {
    id: 16, nombre: 'Fernando Blanco',   cargo: 'Peón',                      obra: null,        estado: 'vacaciones',
    contrato: 'Indefinido',              alertaContrato: false,
    nota: 'Vacaciones hasta 5 julio'
  },
  { id: 17, nombre: 'Tomás Guerrero',    cargo: 'Peón',                      obra: 'Chamberí',  estado: 'trabajando', contrato: 'Obra · Vence 31 octubre',   alertaContrato: false }
];

const CONFIG_ESTADO = {
  trabajando: { label: 'Trabajando',  badgeClass: 'badge-green',  emoji: ''    },
  vacaciones: { label: 'Vacaciones',  badgeClass: 'badge-blue',   emoji: '🏖️ ' },
  baja:       { label: 'Baja médica', badgeClass: 'badge-red',    emoji: '🤒 '  }
};

const COLORES_AVATAR = [
  'linear-gradient(135deg, #6366F1, #8B5CF6)',
  'linear-gradient(135deg, #10B981, #059669)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #EF4444, #DC2626)',
  'linear-gradient(135deg, #3B82F6, #2563EB)',
  'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'linear-gradient(135deg, #EC4899, #DB2777)',
  'linear-gradient(135deg, #14B8A6, #0D9488)',
  'linear-gradient(135deg, #F97316, #EA580C)',
  'linear-gradient(135deg, #84CC16, #65A30D)'
];

export default function EquipoList() {
  const [busqueda, setBusqueda] = useState('');
  const [expandido, setExpandido] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const equipoFiltrado = EQUIPO.filter(e => {
    const q = busqueda.toLowerCase();
    const matchQ = !q || e.nombre.toLowerCase().includes(q) || e.cargo.toLowerCase().includes(q) || (e.obra || '').toLowerCase().includes(q);
    const matchE = filtroEstado === 'todos' || e.estado === filtroEstado;
    return matchQ && matchE;
  });

  const conteos = {
    todos:      EQUIPO.length,
    trabajando: EQUIPO.filter(e => e.estado === 'trabajando').length,
    vacaciones: EQUIPO.filter(e => e.estado === 'vacaciones').length,
    baja:       EQUIPO.filter(e => e.estado === 'baja').length
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>

      {/* Cabecera */}
      <div>
        <h2 style={{ fontWeight: 600, fontSize: 16 }}>Equipo</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
          {EQUIPO.length} empleados · {conteos.trabajando} trabajando hoy
        </p>
      </div>

      {/* Búsqueda + filtros de estado */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar empleado, cargo u obra..."
            style={{ paddingLeft: 36 }}
          />
        </div>

        {['todos', 'trabajando', 'vacaciones', 'baja'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              background: filtroEstado === estado ? 'var(--accent)' : 'var(--border)',
              color: filtroEstado === estado ? 'white' : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {estado === 'todos' ? 'Todos' : CONFIG_ESTADO[estado]?.label}
            <span style={{ marginLeft: 5, opacity: 0.7 }}>{conteos[estado]}</span>
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="scrollable" style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {equipoFiltrado.map((empleado, idx) => (
            <EmpleadoCard
              key={empleado.id}
              empleado={empleado}
              colorAvatar={COLORES_AVATAR[idx % COLORES_AVATAR.length]}
              expandido={expandido === empleado.id}
              onToggle={() => setExpandido(prev => prev === empleado.id ? null : empleado.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Card individual de empleado ----

function EmpleadoCard({ empleado, colorAvatar, expandido, onToggle }) {
  const cfg = CONFIG_ESTADO[empleado.estado];
  const iniciales = empleado.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');

  return (
    <div className="animate-fadein" style={{
      background: 'var(--bg-card)',
      border: `1px solid ${expandido ? 'var(--accent)' : empleado.alertaContrato ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      transition: 'border-color 0.2s'
    }}>
      <div onClick={onToggle} style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Avatar con iniciales */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: colorAvatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontSize: 13, fontWeight: 700, color: 'white'
        }}>
          {iniciales}
        </div>

        {/* Nombre + cargo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <p className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>{empleado.nombre}</p>
            {empleado.alertaContrato && (
              <AlertTriangle size={13} color="var(--yellow)" title={empleado.alertaMsg} style={{ flexShrink: 0 }} />
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{empleado.cargo}</p>
        </div>

        {/* Badge estado + obra */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          <span className={`badge ${cfg.badgeClass}`}>{cfg.emoji}{cfg.label}</span>
          {empleado.obra && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Briefcase size={10} />
              {empleado.obra}
            </span>
          )}
        </div>

        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px 16px',
          background: 'var(--bg-main)',
          display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {/* Datos de contrato y obra */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <InfoItem label="Cargo"    valor={empleado.cargo}    />
            <InfoItem label="Contrato" valor={empleado.contrato} />
            {empleado.obra && <InfoItem label="Obra actual" valor={empleado.obra} />}
          </div>

          {/* Alerta de contrato próximo a vencer */}
          {empleado.alertaContrato && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--yellow-light)', border: '1px solid var(--yellow)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12, color: 'var(--yellow)',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <AlertTriangle size={13} />
              {empleado.alertaMsg}
            </div>
          )}

          {/* Nota informativa (vacaciones / baja) */}
          {empleado.nota && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--accent-light)', border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              {empleado.nota}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, valor }) {
  return (
    <div>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{valor}</p>
    </div>
  );
}
