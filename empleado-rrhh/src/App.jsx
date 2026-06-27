// =============================================
// App.jsx — Componente principal
// Gestiona el estado global y el layout del dashboard
// =============================================

import React, { useState, createContext, useContext } from 'react';
import { UserCheck, Users, ClipboardList } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import CandidatosList from './components/CandidatosList.jsx';
import EquipoList from './components/EquipoList.jsx';
import OnboardingList from './components/OnboardingList.jsx';
import Chat from './components/Chat.jsx';

// Contexto global para compartir el nombre/foto del empleado
export const AppContext = createContext(null);
export function useApp() { return useContext(AppContext); }

const TABS = [
  { id: 'candidatos', label: 'Candidatos',  icono: UserCheck    },
  { id: 'equipo',     label: 'Equipo',      icono: Users        },
  { id: 'onboarding', label: 'Onboarding',  icono: ClipboardList }
];

export default function App() {
  // Nombre y foto del empleado — configurables desde el Sidebar
  const [nombre, setNombreState] = useState('Alex');
  const [foto, setFoto] = useState(null);

  // Toast notifications
  const [notificaciones, setNotificaciones] = useState([]);

  // Tab activa en el panel central
  const [tabActiva, setTabActiva] = useState('candidatos');

  function setNombre(n) { setNombreState(n); }

  function agregarNotificacion(mensaje, tipo = 'info') {
    const notif = { id: Date.now(), mensaje, tipo };
    setNotificaciones(prev => [notif, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== notif.id));
    }, 4000);
  }

  const ctx = { nombre, setNombre, foto, setFoto, agregarNotificacion };

  return (
    <AppContext.Provider value={ctx}>
      {/* Notificaciones flotantes */}
      <NotificacionesFlotantes notificaciones={notificaciones} />

      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>

        {/* ---- Top bar ---- */}
        <header style={{
          height: 52,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12,
          flexShrink: 0, zIndex: 10
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <div style={{
              width: 28, height: 28,
              background: 'var(--accent)', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15
            }}>
              👷
            </div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Empleado IA</span>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Reformas Europa S.L.
          </span>

          <div style={{ flex: 1 }} />

          {/* Indicador en línea */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--green)' }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--green)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            En línea
          </div>
        </header>

        {/* ---- Cuerpo principal ---- */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Sidebar izquierdo */}
          <Sidebar />

          {/* Panel central */}
          <main style={{
            flex: 1,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            padding: '16px 20px'
          }}>
            {/* Tabs de navegación */}
            <div style={{
              display: 'flex', gap: 4,
              marginBottom: 16,
              borderBottom: '1px solid var(--border)'
            }}>
              {TABS.map(tab => {
                const Icono = tab.icono;
                const activa = tabActiva === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setTabActiva(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '10px 16px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${activa ? 'var(--accent)' : 'transparent'}`,
                      color: activa ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font)', fontSize: 13,
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
              {tabActiva === 'candidatos'  && <CandidatosList />}
              {tabActiva === 'equipo'      && <EquipoList />}
              {tabActiva === 'onboarding'  && <OnboardingList />}
            </div>
          </main>

          {/* Panel de chat derecho */}
          <aside style={{ width: 380, flexShrink: 0, overflow: 'hidden' }}>
            <Chat />
          </aside>
        </div>
      </div>
    </AppContext.Provider>
  );
}

// ---- Toast notifications ----

function NotificacionesFlotantes({ notificaciones }) {
  const colores = {
    success: { bg: 'var(--green-light)',  border: 'var(--green)',  color: 'var(--green)'  },
    warning: { bg: 'var(--yellow-light)', border: 'var(--yellow)', color: 'var(--yellow)' },
    error:   { bg: 'var(--red-light)',    border: 'var(--red)',    color: 'var(--red)'    },
    info:    { bg: 'var(--accent-light)', border: 'var(--accent)', color: 'var(--accent)' }
  };

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
      maxWidth: 360, pointerEvents: 'none'
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
            fontSize: 13, fontWeight: 500,
            boxShadow: 'var(--shadow)'
          }}>
            {n.mensaje}
          </div>
        );
      })}
    </div>
  );
}
