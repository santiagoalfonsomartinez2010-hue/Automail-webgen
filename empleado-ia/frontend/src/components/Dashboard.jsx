// =============================================
// Dashboard.jsx - Panel principal
// Layout con Sidebar + Tabs + Chat
// =============================================

import React, { useState } from 'react';
import {
  Ticket, Users, Database, Settings, RefreshCw,
  Wifi, WifiOff, Bell
} from 'lucide-react';
import Sidebar from './Sidebar.jsx';
import TicketList from './TicketList.jsx';
import ClientList from './ClientList.jsx';
import KnowledgeBase from './KnowledgeBase.jsx';
import Chat from './Chat.jsx';
import { useApp } from '../App.jsx';

const TABS = [
  { id: 'tickets', label: 'Tickets', icono: Ticket },
  { id: 'clientes', label: 'Clientes', icono: Users },
  { id: 'conocimiento', label: 'Base de conocimiento', icono: Database }
];

export default function Dashboard() {
  const { config, conectado, agregarNotificacion } = useApp();
  const [tabActiva, setTabActiva] = useState('tickets');
  const [mostrarConfig, setMostrarConfig] = useState(false);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-main)'
    }}>
      {/* ---- Top bar ---- */}
      <header style={{
        height: 52,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        flexShrink: 0,
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginRight: 8
        }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--accent)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14
          }}>
            🤖
          </div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Empleado IA</span>
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* Empresa */}
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          {config?.empresa || 'Mi empresa'}
        </span>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Estado de conexión */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: conectado ? 'var(--green)' : 'var(--text-muted)'
        }}>
          {conectado
            ? <Wifi size={14} />
            : <WifiOff size={14} />
          }
          {conectado ? 'Conectado' : 'Sin conexión'}
        </div>

        {/* Botón de configuración */}
        <button
          className="btn btn-ghost"
          onClick={() => setMostrarConfig(true)}
          style={{ padding: '6px 8px' }}
          title="Configuración"
        >
          <Settings size={15} />
        </button>
      </header>

      {/* ---- Cuerpo principal ---- */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Sidebar izquierdo */}
        <Sidebar />

        {/* Zona central */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '16px 20px'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            marginBottom: 16,
            borderBottom: '1px solid var(--border)',
            paddingBottom: 0
          }}>
            {TABS.map(tab => {
              const Icono = tab.icono;
              const activa = tabActiva === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTabActiva(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activa ? 'var(--accent)' : 'transparent'}`,
                    color: activa ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font)',
                    fontSize: 13,
                    fontWeight: activa ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '-1px'
                  }}
                >
                  <Icono size={15} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenido del tab */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {tabActiva === 'tickets' && <TicketList />}
            {tabActiva === 'clientes' && <ClientList />}
            {tabActiva === 'conocimiento' && <KnowledgeBase />}
          </div>
        </main>

        {/* Panel de chat derecho */}
        <aside style={{ width: 340, flexShrink: 0, overflow: 'hidden' }}>
          <Chat />
        </aside>
      </div>

      {/* Modal de configuración */}
      {mostrarConfig && (
        <ConfigModal onCerrar={() => setMostrarConfig(false)} />
      )}
    </div>
  );
}

// ---- Modal de configuración rápida ----

function ConfigModal({ onCerrar }) {
  const { config, actualizarConfig, agregarNotificacion } = useApp();
  const [datos, setDatos] = useState({
    nombre_empleada: config?.nombre_empleada || '',
    empresa: config?.empresa || '',
    tono: config?.tono || 'neutro'
  });
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const nuevaConfig = await res.json();
      actualizarConfig(nuevaConfig);
      agregarNotificacion('Configuración guardada', 'success');
      onCerrar();
    } catch (error) {
      agregarNotificacion('Error al guardar', 'error');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20
      }}
      onClick={e => e.target === e.currentTarget && onCerrar()}
    >
      <div className="card animate-fadein" style={{
        width: '100%', maxWidth: 480,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 600, fontSize: 16 }}>Configuración</h2>
          <button className="btn btn-ghost" onClick={onCerrar} style={{ padding: '4px 8px' }}>
            ✕
          </button>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            Nombre de la empleada
          </label>
          <input
            className="input"
            value={datos.nombre_empleada}
            onChange={e => setDatos(p => ({ ...p, nombre_empleada: e.target.value }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            Nombre de la empresa
          </label>
          <input
            className="input"
            value={datos.empresa}
            onChange={e => setDatos(p => ({ ...p, empresa: e.target.value }))}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            Tono de comunicación
          </label>
          <select
            className="input"
            value={datos.tono}
            onChange={e => setDatos(p => ({ ...p, tono: e.target.value }))}
          >
            <option value="formal">Formal</option>
            <option value="neutro">Neutro</option>
            <option value="cercano">Cercano</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primary" onClick={guardar} disabled={guardando}>
            {guardando ? <RefreshCw size={14} className="animate-spin" /> : null}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
