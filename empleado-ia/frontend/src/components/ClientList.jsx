// =============================================
// ClientList.jsx - Lista de clientes
// =============================================

import React, { useState, useEffect } from 'react';
import {
  Search, User, Star, Mail, Phone,
  Clock, Hash, ChevronDown, ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../App.jsx';

export default function ClientList() {
  const { agregarNotificacion } = useApp();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [expandido, setExpandido] = useState(null);
  const [ticketsCliente, setTicketsCliente] = useState({});

  useEffect(() => {
    cargarClientes();
  }, []);

  async function cargarClientes() {
    setCargando(true);
    try {
      const res = await fetch('/api/clientes');
      const datos = await res.json();
      setClientes(datos);
    } catch (error) {
      agregarNotificacion('Error cargando clientes', 'error');
    } finally {
      setCargando(false);
    }
  }

  async function cargarTicketsCliente(email) {
    if (ticketsCliente[email]) return;
    try {
      const res = await fetch(`/api/clientes/${encodeURIComponent(email)}/tickets`);
      const datos = await res.json();
      setTicketsCliente(prev => ({ ...prev, [email]: datos.tickets }));
    } catch {}
  }

  function toggleExpandir(clienteId, email) {
    if (expandido === clienteId) {
      setExpandido(null);
    } else {
      setExpandido(clienteId);
      cargarTicketsCliente(email);
    }
  }

  const clientesFiltrados = clientes.filter(c => {
    const q = busqueda.toLowerCase();
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.empresa?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontWeight: 600, fontSize: 16 }}>Clientes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={cargarClientes} title="Actualizar">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Buscador */}
      <div style={{ position: 'relative' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)'
          }}
        />
        <input
          className="input"
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, email o empresa..."
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Lista */}
      <div className="scrollable" style={{ flex: 1 }}>
        {cargando ? (
          <div className="empty-state">
            <RefreshCw size={32} className="animate-spin" />
            <p>Cargando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="empty-state">
            <User size={48} />
            <p style={{ fontWeight: 500 }}>
              {busqueda ? 'No se encontraron resultados' : 'Sin clientes aún'}
            </p>
            <p style={{ fontSize: 12 }}>
              {busqueda
                ? 'Prueba con otros términos de búsqueda'
                : 'Los clientes aparecerán aquí cuando el agente procese emails'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clientesFiltrados.map(cliente => (
              <ClienteCard
                key={cliente.id}
                cliente={cliente}
                expandido={expandido === cliente.id}
                tickets={ticketsCliente[cliente.email] || []}
                onToggle={() => toggleExpandir(cliente.id, cliente.email)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Tarjeta de cliente ----

function ClienteCard({ cliente, expandido, tickets, onToggle }) {
  const ultimaConsulta = new Date(cliente.ultima_consulta);
  const diasDesde = Math.floor((Date.now() - ultimaConsulta.getTime()) / (1000 * 60 * 60 * 24));
  const fechaFormateada = ultimaConsulta.toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div
      className="animate-fadein"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${expandido ? 'var(--accent)' : cliente.es_vip ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        transition: 'border-color 0.2s'
      }}
    >
      {/* Fila principal */}
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
        {/* Avatar */}
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: cliente.es_vip
            ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
            : 'var(--bg-main)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 15,
          fontWeight: 700,
          color: cliente.es_vip ? 'white' : 'var(--text-secondary)'
        }}>
          {cliente.nombre?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>
              {cliente.nombre}
            </p>
            {cliente.es_vip === 1 && (
              <span className="badge badge-purple" style={{ flexShrink: 0 }}>
                <Star size={10} />
                VIP
              </span>
            )}
          </div>
          <p className="truncate" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            {cliente.email}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--bg-main)',
            padding: '3px 8px',
            borderRadius: 12,
            border: '1px solid var(--border)'
          }}>
            <Hash size={11} color="var(--accent)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>
              {cliente.total_tickets || 0}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' }}>
            <Clock size={10} />
            {diasDesde === 0 ? 'Hoy' : diasDesde === 1 ? 'Ayer' : `Hace ${diasDesde}d`}
          </div>
        </div>

        {/* Icono expandir */}
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
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          {/* Datos de contacto */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <InfoItem icono={<Mail size={13} />} label="Email" valor={cliente.email} />
            {cliente.telefono && (
              <InfoItem icono={<Phone size={13} />} label="Teléfono" valor={cliente.telefono} />
            )}
            {cliente.empresa && (
              <InfoItem icono={<User size={13} />} label="Empresa" valor={cliente.empresa} />
            )}
            <InfoItem
              icono={<Clock size={13} />}
              label="Primera consulta"
              valor={new Date(cliente.primera_consulta).toLocaleDateString('es-ES')}
            />
            <InfoItem
              icono={<Clock size={13} />}
              label="Última consulta"
              valor={fechaFormateada}
            />
          </div>

          {/* Instrucciones VIP */}
          {cliente.instrucciones_vip && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--accent-light)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13,
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontWeight: 500, color: 'var(--accent)', marginBottom: 4, fontSize: 12 }}>
                Instrucciones VIP
              </p>
              {cliente.instrucciones_vip}
            </div>
          )}

          {/* Historial de tickets */}
          {tickets.length > 0 && (
            <div>
              <p style={{
                fontSize: 11, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8
              }}>
                Historial de tickets
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {tickets.map(ticket => (
                  <div key={ticket.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)'
                  }}>
                    <span className={`badge ${
                      ticket.estado === 'resuelto' ? 'badge-green' :
                      ticket.estado === 'escalado' ? 'badge-yellow' : 'badge-blue'
                    }`} style={{ fontSize: 10 }}>
                      {ticket.estado}
                    </span>
                    <p className="truncate" style={{ flex: 1, fontSize: 13 }}>
                      {ticket.asunto}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {new Date(ticket.fecha).toLocaleDateString('es-ES')}
                    </span>
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

function InfoItem({ icono, label, valor }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
        <span style={{ color: 'var(--text-muted)' }}>{icono}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{valor}</p>
    </div>
  );
}
