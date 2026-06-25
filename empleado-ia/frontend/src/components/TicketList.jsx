// =============================================
// TicketList.jsx - Lista de tickets del día
// =============================================

import React, { useState, useEffect } from 'react';
import {
  RefreshCw, AlertTriangle, CheckCircle, Clock,
  ArrowUpCircle, ChevronDown, ChevronUp, User,
  Mail, MessageSquare, Tag, Zap
} from 'lucide-react';
import { useApp } from '../App.jsx';

// Configuración visual por estado
const CONFIG_ESTADO = {
  resuelto: { label: 'Resuelto', badgeClass: 'badge-green', icono: <CheckCircle size={12} /> },
  escalado: { label: 'Escalado', badgeClass: 'badge-yellow', icono: <AlertTriangle size={12} /> },
  pendiente: { label: 'Pendiente', badgeClass: 'badge-blue', icono: <Clock size={12} /> }
};

const CONFIG_URGENCIA = {
  baja: { label: 'Baja', color: 'var(--text-muted)' },
  normal: { label: 'Normal', color: 'var(--text-secondary)' },
  alta: { label: 'Alta', color: 'var(--yellow)' },
  critica: { label: 'Crítica', color: 'var(--red)' }
};

const CONFIG_CATEGORIA = {
  consulta: { label: 'Consulta', badgeClass: 'badge-blue' },
  reclamacion: { label: 'Reclamación', badgeClass: 'badge-red' },
  pedido: { label: 'Pedido', badgeClass: 'badge-green' },
  devolucion: { label: 'Devolución', badgeClass: 'badge-yellow' },
  garantia: { label: 'Garantía', badgeClass: 'badge-purple' },
  otro: { label: 'Otro', badgeClass: 'badge-gray' }
};

export default function TicketList() {
  const { ticketsNuevos, agregarNotificacion } = useApp();
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [expandido, setExpandido] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    cargarTickets();
  }, []);

  // Añadir tickets nuevos que llegan por Socket.io
  useEffect(() => {
    if (ticketsNuevos.length > 0) {
      setTickets(prev => {
        const ids = new Set(prev.map(t => t.id));
        const nuevos = ticketsNuevos.filter(t => !ids.has(t.id));
        return [...nuevos, ...prev];
      });
    }
  }, [ticketsNuevos]);

  async function cargarTickets() {
    setCargando(true);
    try {
      const res = await fetch('/api/tickets/hoy');
      const datos = await res.json();
      setTickets(datos);
    } catch (error) {
      agregarNotificacion('Error cargando tickets', 'error');
    } finally {
      setCargando(false);
    }
  }

  async function procesarEmails() {
    setProcesando(true);
    try {
      await fetch('/api/agente/procesar', { method: 'POST' });
      agregarNotificacion('Procesando emails...', 'info');
      setTimeout(cargarTickets, 3000);
    } catch (error) {
      agregarNotificacion('Error al procesar emails', 'error');
    } finally {
      setTimeout(() => setProcesando(false), 3000);
    }
  }

  const ticketsFiltrados = filtroEstado === 'todos'
    ? tickets
    : tickets.filter(t => t.estado === filtroEstado);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: 16 }}>Tickets de hoy</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
            {tickets.length} email{tickets.length !== 1 ? 's' : ''} procesado{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={cargarTickets} title="Actualizar">
            <RefreshCw size={14} />
          </button>
          <button
            className="btn btn-primary"
            onClick={procesarEmails}
            disabled={procesando}
          >
            {procesando ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
            {procesando ? 'Procesando...' : 'Procesar emails'}
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['todos', 'resuelto', 'escalado', 'pendiente'].map(estado => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              background: filtroEstado === estado ? 'var(--accent)' : 'var(--border)',
              color: filtroEstado === estado ? 'white' : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {estado === 'todos' ? 'Todos' : CONFIG_ESTADO[estado]?.label}
            {estado === 'todos' && (
              <span style={{ marginLeft: 6, opacity: 0.7 }}>{tickets.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de tickets */}
      <div className="scrollable" style={{ flex: 1 }}>
        {cargando ? (
          <div className="empty-state">
            <RefreshCw size={32} className="animate-spin" />
            <p>Cargando tickets...</p>
          </div>
        ) : ticketsFiltrados.length === 0 ? (
          <div className="empty-state">
            <Mail size={48} />
            <p style={{ fontWeight: 500 }}>Sin tickets {filtroEstado !== 'todos' ? CONFIG_ESTADO[filtroEstado]?.label.toLowerCase() + 's' : 'aún'}</p>
            <p style={{ fontSize: 12 }}>Pulsa "Procesar emails" para que tu empleada empiece a trabajar</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ticketsFiltrados.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                expandido={expandido === ticket.id}
                onToggle={() => setExpandido(prev => prev === ticket.id ? null : ticket.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Tarjeta de ticket individual ----

function TicketCard({ ticket, expandido, onToggle }) {
  const [acciones, setAcciones] = useState([]);

  useEffect(() => {
    if (expandido) cargarAcciones();
  }, [expandido]);

  async function cargarAcciones() {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/acciones`);
      const datos = await res.json();
      setAcciones(datos);
    } catch {}
  }

  const cfgEstado = CONFIG_ESTADO[ticket.estado] || CONFIG_ESTADO.pendiente;
  const cfgUrgencia = CONFIG_URGENCIA[ticket.urgencia] || CONFIG_URGENCIA.normal;
  const cfgCategoria = CONFIG_CATEGORIA[ticket.categoria] || CONFIG_CATEGORIA.otro;
  const hora = new Date(ticket.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="animate-fadein"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${expandido ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        transition: 'border-color 0.2s'
      }}
    >
      {/* Cabecera del ticket */}
      <div
        onClick={onToggle}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}
      >
        {/* Indicador de urgencia (barra lateral) */}
        <div style={{
          width: 3,
          height: 44,
          borderRadius: 2,
          background: cfgUrgencia.color,
          flexShrink: 0
        }} />

        {/* Información principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className={`badge ${cfgEstado.badgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {cfgEstado.icono}
              {cfgEstado.label}
            </span>
            <span className={`badge ${cfgCategoria.badgeClass}`}>
              {cfgCategoria.label}
            </span>
            {ticket.es_vip === 1 && (
              <span className="badge badge-purple">VIP</span>
            )}
            {ticket.urgencia === 'alta' || ticket.urgencia === 'critica' ? (
              <span style={{ fontSize: 11, color: cfgUrgencia.color, fontWeight: 600 }}>
                ⚡ {cfgUrgencia.label}
              </span>
            ) : null}
          </div>
          <p className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>
            {ticket.asunto}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {ticket.cliente_nombre || ticket.cliente_email}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{hora}</span>
          </div>
        </div>

        {/* Botón expandir */}
        <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          {expandido ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: 'var(--bg-main)'
        }}>
          {/* Datos del cliente */}
          <div style={{ display: 'flex', gap: 20 }}>
            <DetalleItem
              icono={<User size={13} />}
              label="Cliente"
              valor={`${ticket.cliente_nombre} <${ticket.cliente_email}>`}
            />
            {ticket.confianza_ia > 0 && (
              <DetalleItem
                icono={<Zap size={13} />}
                label="Confianza IA"
                valor={`${ticket.confianza_ia}%`}
              />
            )}
          </div>

          {/* Email original */}
          {ticket.email_original && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email recibido
              </p>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                maxHeight: 140,
                overflowY: 'auto'
              }}>
                {ticket.email_original}
              </div>
            </div>
          )}

          {/* Respuesta enviada / motivo de escalado */}
          {ticket.respuesta_enviada && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Respuesta enviada
              </p>
              <div style={{
                background: 'rgba(16,185,129,0.05)',
                border: '1px solid var(--green)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
                maxHeight: 140,
                overflowY: 'auto'
              }}>
                {ticket.respuesta_enviada}
              </div>
            </div>
          )}

          {/* Notas internas */}
          {ticket.notas_internas && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Notas internas
              </p>
              <div style={{
                background: 'rgba(245,158,11,0.05)',
                border: '1px solid var(--yellow)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                fontStyle: 'italic'
              }}>
                {ticket.notas_internas}
              </div>
            </div>
          )}

          {/* Timeline de acciones */}
          {acciones.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Registro de acciones
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {acciones.map((accion, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{
                      width: 6, height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      marginTop: 5,
                      flexShrink: 0
                    }} />
                    <div>
                      <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>
                        {new Date(accion.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {accion.descripcion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetalleItem({ icono, label, valor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ color: 'var(--text-muted)' }}>{icono}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{valor}</p>
    </div>
  );
}
