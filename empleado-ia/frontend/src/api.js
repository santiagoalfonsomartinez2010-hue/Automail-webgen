// =============================================
// api.js - Abstraction layer: real API with mock fallback
// When VITE_DEMO_MODE=true or backend unreachable, uses mockData
// =============================================

import * as mock from './mockData.js';

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

async function apiFetch(path, options) {
  if (DEMO) return null;
  try {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function getConfig() {
  const data = await apiFetch('/api/config');
  return data ?? mock.mockConfig;
}

export async function postConfig(body) {
  const data = await apiFetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return data ?? { ...mock.mockConfig, ...body };
}

export async function getStats() {
  const data = await apiFetch('/api/stats');
  return data ?? mock.mockStats;
}

export async function getTicketsHoy() {
  const data = await apiFetch('/api/tickets/hoy');
  return data ?? mock.mockTickets;
}

export async function getTicketAcciones(ticketId) {
  const data = await apiFetch(`/api/tickets/${ticketId}/acciones`);
  return data ?? (mock.mockAcciones[ticketId] || []);
}

export async function getClientes() {
  const data = await apiFetch('/api/clientes');
  return data ?? mock.mockClientes;
}

export async function getConocimiento() {
  const data = await apiFetch('/api/conocimiento');
  return data ?? mock.mockConocimiento;
}

export async function getChatHistorial() {
  const data = await apiFetch('/api/chat/historial');
  return data ?? mock.mockChat;
}

export async function postChat(mensaje) {
  const data = await apiFetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje })
  });
  if (data) return data;
  // Demo: echo a canned response
  return {
    respuesta: mock.mockDemoReply(mensaje)
  };
}

export async function postOnboardingCompletar(body) {
  const data = await apiFetch('/api/onboarding/completar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return data ?? { ok: true, config: { ...mock.mockConfig, ...body, onboarding_completado: 1 } };
}

export async function postAgentesProcesar() {
  return apiFetch('/api/agente/procesar', { method: 'POST' });
}

export async function postSheetsVerificar(sheetId) {
  const data = await apiFetch('/api/sheets/verificar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet_id: sheetId })
  });
  return data ?? { ok: true, hojas: ['FAQs', 'Productos', 'Políticas', 'Clientes_VIP'] };
}

export async function postSheetsSincronizar() {
  return apiFetch('/api/sheets/sincronizar', { method: 'POST' });
}

export const isDemoMode = DEMO;
