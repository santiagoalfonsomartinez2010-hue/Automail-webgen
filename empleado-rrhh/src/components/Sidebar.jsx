// =============================================
// Sidebar.jsx — Panel izquierdo del dashboard
// Perfil editable del empleado + stats RRHH del día
// =============================================

import React, { useState, useRef } from 'react';
import {
  Bot, Edit2, Save, X,
  FileText, UserCheck, Calendar, XCircle,
  Users, AlertTriangle
} from 'lucide-react';
import { useApp } from '../App.jsx';

export default function Sidebar() {
  const { nombre, setNombre, foto, setFoto, agregarNotificacion } = useApp();

  // Estado del modo de edición
  const [editando, setEditando] = useState(false);
  const [tempNombre, setTempNombre] = useState(nombre);
  const [tempFoto, setTempFoto] = useState(foto);
  const fotoInputRef = useRef(null);

  function handleFotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setTempFoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function iniciarEdicion() {
    setTempNombre(nombre);
    setTempFoto(foto);
    setEditando(true);
  }

  function guardar() {
    if (!tempNombre.trim()) return;
    setNombre(tempNombre.trim());
    setFoto(tempFoto);
    setEditando(false);
    agregarNotificacion('Perfil actualizado', 'success');
  }

  function cancelar() {
    setEditando(false);
  }

  // Foto a mostrar (real o temporal en modo edición)
  const fotoActual = editando ? tempFoto : foto;

  return (
    <aside style={{
      width: 260,
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
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, padding: '16px 0',
        borderBottom: '1px solid var(--border)'
      }}>
        {/* Avatar con punto verde pulsante */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: fotoActual ? 'none' : 'linear-gradient(135deg, var(--accent) 0%, #8B5CF6 100%)',
              border: '3px solid var(--border)',
              overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: editando ? 'pointer' : 'default',
              transition: 'opacity 0.2s'
            }}
            onClick={() => editando && fotoInputRef.current?.click()}
            title={editando ? 'Haz click para cambiar la foto' : ''}
          >
            {fotoActual
              ? <img src={fotoActual} alt={nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Bot size={32} color="white" />
            }
            {editando && (
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%'
              }}>
                <span style={{ fontSize: 20 }}>📷</span>
              </div>
            )}
          </div>

          {/* Input de foto oculto */}
          <input
            ref={fotoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFotoChange}
          />

          {/* Punto verde pulsante */}
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 14, height: 14,
            borderRadius: '50%',
            background: 'var(--green)',
            border: '2px solid var(--bg-card)',
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        </div>

        {/* Modo edición */}
        {editando ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              className="input"
              value={tempNombre}
              onChange={e => setTempNombre(e.target.value)}
              placeholder="Nombre del empleado"
              style={{ textAlign: 'center', fontSize: 14 }}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && guardar()}
            />
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
              Click en el avatar para cambiar foto
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-ghost" onClick={cancelar}
                style={{ flex: 1, fontSize: 12, padding: '6px 8px' }}>
                <X size={12} /> Cancelar
              </button>
              <button className="btn btn-primary" onClick={guardar}
                style={{ flex: 1, fontSize: 12, padding: '6px 8px' }}>
                <Save size={12} /> Guardar
              </button>
            </div>
          </div>
        ) : (
          /* Modo visualización */
          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ fontWeight: 700, fontSize: 16 }}>{nombre}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 1 }}>
              Empleado/a de Recursos Humanos
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 1 }}>
              Reformas Europa S.L.
            </p>

            {/* Badge estado */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              marginTop: 7, padding: '3px 10px',
              background: 'var(--green-light)', borderRadius: 20,
              fontSize: 11, fontWeight: 600, color: 'var(--green)'
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
              Trabajando ahora · Incorporado hace 1 mes
            </div>

            <button
              className="btn btn-ghost"
              onClick={iniciarEdicion}
              style={{ marginTop: 10, fontSize: 11, padding: '5px 12px', width: '100%' }}
            >
              <Edit2 size={11} />
              Editar perfil
            </button>
          </div>
        )}
      </div>

      {/* ---- Stats de hoy ---- */}
      <div>
        <SeccionLabel>Hoy</SeccionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StatItem icono={<FileText  size={14} />} label="CVs recibidos"         valor={8} color="var(--text-secondary)" />
          <StatItem icono={<UserCheck size={14} />} label="Encajan"               valor={3} color="var(--green)"          />
          <StatItem icono={<Calendar  size={14} />} label="Entrevistas agendadas" valor={2} color="var(--accent)"         />
          <StatItem icono={<XCircle   size={14} />} label="Rechazos enviados"     valor={4} color="var(--red)"            />
        </div>
      </div>

      {/* ---- Estado del equipo ---- */}
      <div>
        <SeccionLabel>Estado del equipo</SeccionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <StatItem icono={<Users size={14} />}                        label="Trabajando"    valor={14} color="var(--green)"  />
          <StatItem icono={<span style={{ fontSize: 13 }}>🏖️</span>}  label="De vacaciones" valor={2}  color="var(--blue)"   />
          <StatItem icono={<span style={{ fontSize: 13 }}>🤒</span>}  label="De baja"       valor={1}  color="var(--yellow)" />
        </div>
      </div>

      {/* ---- Alertas ---- */}
      <div>
        <SeccionLabel>Alertas</SeccionLabel>
        <div style={{
          padding: '10px 12px',
          background: 'var(--yellow-light)',
          border: '1px solid var(--yellow)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'flex-start', gap: 8
        }}>
          <AlertTriangle size={14} color="var(--yellow)" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--yellow)' }}>
              Contratos vencen este mes
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>
              José Fernández (31 jul) y Manuel Torres (15 ago)
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Chip de demo */}
      <div style={{
        padding: '8px 10px',
        background: 'var(--accent-light)',
        border: '1px solid var(--accent)',
        borderRadius: 'var(--radius-sm)',
        fontSize: 11,
        color: 'var(--accent)',
        textAlign: 'center'
      }}>
        Demo — Reformas Europa S.L.
      </div>
    </aside>
  );
}

// ---- Subcomponentes ----

function SeccionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.8px',
      color: 'var(--text-muted)', marginBottom: 10
    }}>
      {children}
    </p>
  );
}

function StatItem({ icono, label, valor, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
