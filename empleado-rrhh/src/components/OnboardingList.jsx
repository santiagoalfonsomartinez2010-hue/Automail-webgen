// =============================================
// OnboardingList.jsx — Seguimiento de onboarding
// Tarjetas expandibles con checklist de pasos
// =============================================

import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, User } from 'lucide-react';

const ONBOARDING = [
  {
    id: 1,
    nombre: 'Alejandro Ruiz',
    puesto: 'Oficial 1ª Albañilería',
    obra: 'Serrano',
    fechaIncorporacion: '30 junio 2025',
    estado: 'en_curso',
    pasos: [
      { id: 1, texto: 'Email de bienvenida enviado',           hecho: true  },
      { id: 2, texto: 'Documentación solicitada (DNI, TC2…)',  hecho: true  },
      { id: 3, texto: 'Reunión de bienvenida con Pedro Ruiz',  hecho: true  },
      { id: 4, texto: 'Entrega de EPIs (casco, botas, chaleco)', hecho: false },
      { id: 5, texto: 'Firma de contrato (presencial)',         hecho: false },
      { id: 6, texto: 'Alta en la Seguridad Social',           hecho: false },
      { id: 7, texto: 'Añadir al grupo de WhatsApp de obra',   hecho: false },
      { id: 8, texto: 'Formación PRL básica (online)',         hecho: false }
    ]
  },
  {
    id: 2,
    nombre: 'Marcos Jiménez',
    puesto: 'Peón de obra',
    obra: 'Chamberí',
    fechaIncorporacion: '7 julio 2025',
    estado: 'pendiente',
    pasos: [
      { id: 1, texto: 'Email de bienvenida enviado',           hecho: true  },
      { id: 2, texto: 'Documentación solicitada (DNI, TC2…)',  hecho: false },
      { id: 3, texto: 'Entrega de EPIs (casco, botas, chaleco)', hecho: false },
      { id: 4, texto: 'Firma de contrato (presencial)',         hecho: false },
      { id: 5, texto: 'Alta en la Seguridad Social',           hecho: false },
      { id: 6, texto: 'Añadir al grupo de WhatsApp de obra',   hecho: false },
      { id: 7, texto: 'Reunión de bienvenida con Antonio Vega', hecho: false },
      { id: 8, texto: 'Formación PRL básica (online)',         hecho: false }
    ]
  }
];

const CONFIG_ESTADO = {
  en_curso:  { label: 'En curso',   badgeClass: 'badge-blue'   },
  pendiente: { label: 'Pendiente',  badgeClass: 'badge-yellow' },
  completo:  { label: 'Completado', badgeClass: 'badge-green'  }
};

const COLORES_AVATAR = [
  'linear-gradient(135deg, #6366F1, #8B5CF6)',
  'linear-gradient(135deg, #10B981, #059669)'
];

function calcularProgreso(pasos) {
  const hechos = pasos.filter(p => p.hecho).length;
  return { hechos, total: pasos.length, pct: Math.round((hechos / pasos.length) * 100) };
}

function colorBarra(pct) {
  if (pct >= 70) return 'var(--green)';
  if (pct >= 30) return 'var(--yellow)';
  return 'var(--red)';
}

export default function OnboardingList() {
  const [expandido, setExpandido] = useState(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>

      {/* Cabecera */}
      <div>
        <h2 style={{ fontWeight: 600, fontSize: 16 }}>Onboarding</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
          {ONBOARDING.length} incorporaciones en curso · seguimiento de pasos
        </p>
      </div>

      {/* Lista */}
      <div className="scrollable" style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ONBOARDING.map((emp, idx) => {
            const prog = calcularProgreso(emp.pasos);
            const cfg  = CONFIG_ESTADO[emp.estado];
            const iniciales = emp.nombre.split(' ').slice(0, 2).map(n => n[0]).join('');
            const abierto = expandido === emp.id;

            return (
              <div key={emp.id} className="animate-fadein" style={{
                background: 'var(--bg-card)',
                border: `1px solid ${abierto ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}>
                {/* Fila resumen */}
                <div
                  onClick={() => setExpandido(prev => prev === emp.id ? null : emp.id)}
                  style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: COLORES_AVATAR[idx],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: 14, fontWeight: 700, color: 'white'
                  }}>
                    {iniciales}
                  </div>

                  {/* Nombre + puesto + barra de progreso */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <p className="truncate" style={{ fontWeight: 600, fontSize: 14 }}>{emp.nombre}</p>
                      <span className={`badge ${cfg.badgeClass}`} style={{ flexShrink: 0 }}>{cfg.label}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 6 }}>
                      {emp.puesto} · Obra {emp.obra}
                    </p>
                    {/* Barra de progreso */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        flex: 1, height: 5,
                        background: 'var(--border)',
                        borderRadius: 3, overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${prog.pct}%`,
                          background: colorBarra(prog.pct),
                          borderRadius: 3,
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: colorBarra(prog.pct), flexShrink: 0 }}>
                        {prog.pct}%
                      </span>
                    </div>
                  </div>

                  {/* Contador pasos + chevron */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {prog.hechos}/{prog.total}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>pasos</span>
                  </div>

                  <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4 }}>
                    {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Detalle expandido */}
                {abierto && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '14px 16px',
                    background: 'var(--bg-main)',
                    display: 'flex', flexDirection: 'column', gap: 12
                  }}>
                    {/* Meta info */}
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <InfoItem label="Incorporación" valor={emp.fechaIncorporacion} />
                      <InfoItem label="Obra asignada"  valor={emp.obra}             />
                    </div>

                    {/* Checklist */}
                    <div>
                      <p style={{
                        fontSize: 11, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8
                      }}>
                        Pasos del onboarding
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {emp.pasos.map(paso => (
                          <div key={paso.id} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '7px 10px',
                            background: paso.hecho ? 'rgba(16,185,129,0.06)' : 'var(--bg-card)',
                            border: `1px solid ${paso.hecho ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-sm)'
                          }}>
                            {paso.hecho
                              ? <CheckCircle2 size={15} color="var(--green)" style={{ flexShrink: 0 }} />
                              : <Circle       size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                            }
                            <span style={{
                              fontSize: 12,
                              color: paso.hecho ? 'var(--text-secondary)' : 'var(--text-primary)',
                              textDecoration: paso.hecho ? 'line-through' : 'none',
                              opacity: paso.hecho ? 0.7 : 1
                            }}>
                              {paso.texto}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
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
