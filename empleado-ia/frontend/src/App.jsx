// =============================================
// App.jsx - Entrada principal de la aplicación
// Gestiona el estado global y el routing entre
// onboarding y dashboard
// =============================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import { io } from 'socket.io-client';
import Onboarding from './components/Onboarding.jsx';
import Dashboard from './components/Dashboard.jsx';
import { getConfig, getStats, isDemoMode } from './api.js';

// Contexto global para compartir estado entre componentes
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

// En producción el socket conecta al mismo origen; en dev al backend local
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';
const socket = isDemoMode ? { connect(){}, disconnect(){}, on(){}, off(){} } : io(SOCKET_URL, { autoConnect: false });

export default function App() {
  const [config, setConfig] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [conectado, setConectado] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [statsHoy, setStatsHoy] = useState({
    total: 0, resueltos: 0, escalados: 0, pendientes: 0
  });
  const [ticketsNuevos, setTicketsNuevos] = useState([]);

  // Cargar configuración al montar
  useEffect(() => {
    cargarConfig();
  }, []);

  // Conectar Socket.io cuando se tiene config
  useEffect(() => {
    if (!config) return;

    socket.connect();

    socket.on('connect', () => {
      setConectado(true);
      console.log('🔌 Socket.io conectado');
    });

    socket.on('disconnect', () => {
      setConectado(false);
    });

    // Nuevo ticket procesado
    socket.on('ticket:nuevo', (datos) => {
      setTicketsNuevos(prev => [datos.ticket, ...prev]);
      agregarNotificacion(datos.mensaje, datos.decision === 'escalado' ? 'warning' : 'success');
      cargarStats();
    });

    // Eventos del agente
    socket.on('agente:progreso', (datos) => {
      agregarNotificacion(datos.mensaje, 'info');
    });

    socket.on('agente:fin', (datos) => {
      if (datos.procesados > 0) {
        agregarNotificacion(datos.mensaje, 'success');
      }
    });

    socket.on('agente:error', (datos) => {
      agregarNotificacion(datos.mensaje, 'error');
    });

    socket.on('sheets:sincronizado', () => {
      agregarNotificacion('Base de conocimiento actualizada', 'info');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('ticket:nuevo');
      socket.off('agente:progreso');
      socket.off('agente:fin');
      socket.off('agente:error');
      socket.off('sheets:sincronizado');
      socket.disconnect();
    };
  }, [config]);

  // Cargar stats periódicamente
  useEffect(() => {
    if (!config?.onboarding_completado) return;
    cargarStats();
    const intervalo = setInterval(cargarStats, 30000);
    return () => clearInterval(intervalo);
  }, [config]);

  async function cargarConfig() {
    try {
      const datos = await getConfig();
      setConfig(datos);
    } catch (error) {
      console.error('Error cargando config:', error);
    } finally {
      setCargando(false);
    }
  }

  async function cargarStats() {
    try {
      const datos = await getStats();
      setStatsHoy(datos);
    } catch (error) {
      console.error('Error cargando stats:', error);
    }
  }

  function agregarNotificacion(mensaje, tipo = 'info') {
    const notif = { id: Date.now(), mensaje, tipo };
    setNotificaciones(prev => [notif, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
    }, 4000);
  }

  function actualizarConfig(nuevaConfig) {
    setConfig(prev => ({ ...prev, ...nuevaConfig }));
  }

  async function onOnboardingCompleto() {
    await cargarConfig();
  }

  if (cargando) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Iniciando...</p>
        </div>
      </div>
    );
  }

  const contextValue = {
    config,
    actualizarConfig,
    socket,
    conectado,
    statsHoy,
    setStatsHoy,
    ticketsNuevos,
    setTicketsNuevos,
    agregarNotificacion,
    cargarStats
  };

  return (
    <AppContext.Provider value={contextValue}>
      {/* Notificaciones flotantes */}
      <NotificacionesFlotantes notificaciones={notificaciones} />

      {config?.onboarding_completado
        ? <Dashboard />
        : <Onboarding onCompleto={onOnboardingCompleto} />
      }
    </AppContext.Provider>
  );
}

// Notificaciones toast en la esquina superior derecha
function NotificacionesFlotantes({ notificaciones }) {
  const colores = {
    success: { bg: 'var(--green-light)', border: 'var(--green)', color: 'var(--green)' },
    warning: { bg: 'var(--yellow-light)', border: 'var(--yellow)', color: 'var(--yellow)' },
    error: { bg: 'var(--red-light)', border: 'var(--red)', color: 'var(--red)' },
    info: { bg: 'var(--accent-light)', border: 'var(--accent)', color: 'var(--accent)' }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      right: 16,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      maxWidth: 360,
      pointerEvents: 'none'
    }}>
      {notificaciones.map(n => {
        const c = colores[n.tipo] || colores.info;
        return (
          <div key={n.id} className="animate-fadein" style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            color: c.color,
            fontSize: 13,
            fontWeight: 500,
            boxShadow: 'var(--shadow)'
          }}>
            {n.mensaje}
          </div>
        );
      })}
    </div>
  );
}
