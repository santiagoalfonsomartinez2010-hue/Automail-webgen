// =============================================
// Sidebar.jsx - Panel izquierdo del dashboard
// Muestra el perfil del empleado IA y stats del día
// =============================================

import React from 'react';
import {
  Zap, CheckCircle, AlertTriangle, Clock,
  TrendingUp, Inbox, Bot
} from 'lucide-react';
import { useApp } from '../App.jsx';

export default function Sidebar() {
  const { config, statsHoy, conectado } = useApp();

  const total = statsHoy?.total || 0;
  const resueltos = statsHoy?.resueltos || 0;
  const escalados = statsHoy?.escalados || 0;
  const pendientes = statsHoy?.pendientes || 0;
  const porcentajeResueltos = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  const fotoUrl = config?.foto_url;
  const nombre = config?.nombre_empleada || 'Sofía';
  const empresa = config?.empresa || 'Tu empresa';

  return (
    <aside style={{
      width: 240,
      flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      gap: 16,
      overflowY: 'auto'
    }}>
      {/* ---- Perfil del empleado ---- */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '16px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Avatar con indicador de estado */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: fotoUrl ? 'none' : 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)',
            border: '3px solid var(--border)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={nombre}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Bot size={32} color="white" />
            )}
          </div>

          {/* Punto de estado (verde pulsante) */}
          <div style={{
            position: 'absolute',
            bottom: 2, right: 2,
            width: 14, height: 14,
            borderRadius: '50%',
            background: conectado ? 'var(--green)' : 'var(--text-muted)',
            border: '2px solid var(--bg-card)',
            animation: conectado ? 'pulse 2s ease-in-out infinite' : 'none'
          }} />
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{nombre}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 1 }}>
            {empresa}
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            marginTop: 6,
            padding: '3px 10px',
            background: conectado ? 'var(--green-light)' : 'rgba(74,85,104,0.2)',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            color: conectado ? 'var(--green)' : 'var(--text-muted)'
          }}>
            <div style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: 'currentColor'
            }} />
            {conectado ? 'Trabajando ahora' : 'Desconectada'}
          </div>
        </div>
      </div>

      {/* ---- Stats del día ---- */}
      <div>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--text-muted)',
          marginBottom: 10
        }}>
          Hoy
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StatItem
            icono={<Inbox size={14} />}
            label="Total recibidos"
            valor={total}
            color="var(--text-secondary)"
          />
          <StatItem
            icono={<CheckCircle size={14} />}
            label="Resueltos"
            valor={resueltos}
            color="var(--green)"
          />
          <StatItem
            icono={<AlertTriangle size={14} />}
            label="Escalados"
            valor={escalados}
            color="var(--yellow)"
          />
          <StatItem
            icono={<Clock size={14} />}
            label="Pendientes"
            valor={pendientes}
            color="var(--accent)"
          />
        </div>

        {/* Barra de progreso */}
        {total > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 5,
              fontSize: 11,
              color: 'var(--text-muted)'
            }}>
              <span>Tasa de resolución</span>
              <span style={{ fontWeight: 600, color: porcentajeResueltos > 70 ? 'var(--green)' : 'var(--yellow)' }}>
                {porcentajeResueltos}%
              </span>
            </div>
            <div style={{
              height: 6,
              background: 'var(--border)',
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${porcentajeResueltos}%`,
                background: porcentajeResueltos > 70
                  ? 'var(--green)'
                  : porcentajeResueltos > 40
                    ? 'var(--yellow)'
                    : 'var(--red)',
                borderRadius: 3,
                transition: 'width 0.5s ease'
              }} />
            </div>

            {/* Desglose visual */}
            <div style={{
              height: 4,
              marginTop: 4,
              display: 'flex',
              borderRadius: 2,
              overflow: 'hidden',
              gap: 1
            }}>
              {resueltos > 0 && (
                <div style={{
                  flex: resueltos,
                  background: 'var(--green)',
                  borderRadius: '2px 0 0 2px'
                }} />
              )}
              {escalados > 0 && (
                <div style={{ flex: escalados, background: 'var(--yellow)' }} />
              )}
              {pendientes > 0 && (
                <div style={{
                  flex: pendientes,
                  background: 'var(--accent)',
                  borderRadius: '0 2px 2px 0'
                }} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- Rendimiento ---- */}
      <div>
        <p style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.8px',
          color: 'var(--text-muted)',
          marginBottom: 10
        }}>
          Rendimiento
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {statsHoy?.tiempo_medio_respuesta && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Zap size={12} color="var(--accent)" />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tiempo medio</span>
              </div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>
                {statsHoy.tiempo_medio_respuesta < 60
                  ? `${statsHoy.tiempo_medio_respuesta}m`
                  : `${Math.round(statsHoy.tiempo_medio_respuesta / 60)}h`
                }
              </p>
            </div>
          )}

          <div style={{
            padding: '10px 12px',
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <TrendingUp size={12} color="var(--green)" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tasa auto-resolución</span>
            </div>
            <p style={{ fontWeight: 600, fontSize: 16 }}>
              {total > 0 ? `${Math.round(((total - escalados) / total) * 100)}%` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ---- Spacer ---- */}
      <div style={{ flex: 1 }} />

      {/* ---- Modo ---- */}
      <div style={{
        padding: '8px 10px',
        background: 'var(--accent-light)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11,
        color: 'var(--accent)',
        textAlign: 'center'
      }}>
        Modo simulación activo
      </div>
    </aside>
  );
}

function StatItem({ icono, label, valor, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '7px 10px',
      background: 'var(--bg-main)',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ color }}>{icono}</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <span style={{ fontWeight: 700, fontSize: 16, color }}>{valor}</span>
    </div>
  );
}
