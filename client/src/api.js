// Thin wrapper around the server REST API. In dev, Vite proxies "/api" to the
// Node server (see vite.config.js), so we use relative URLs here.

const BASE = '/api';

// Parses the JSON body and, on a non-2xx response, throws an error that carries
// the HTTP status and the servers "details" array (used to show field errors).
async function handle(res) {
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const message =
      (body && (body.error || body.message)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.details = (body && body.details) || [];
    throw err;
  }
  return body;
}

export async function getMenu() {
  const res = await fetch(`${BASE}/menu`);
  return handle(res);
}

export async function createOrder(order) {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return handle(res);
}

export async function getOrder(id) {
  const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}`);
  return handle(res);
}

// statuses: array of status strings (joined as ?status=a,b) or undefined for all.
export async function listOrders(statuses) {
  let url = `${BASE}/orders`;
  if (statuses && statuses.length > 0) {
    url += `?status=${encodeURIComponent(statuses.join(','))}`;
  }
  const res = await fetch(url);
  return handle(res);
}

export async function updateStatus(id, status) {
  const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handle(res);
}