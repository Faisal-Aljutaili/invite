const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const auth = {
  register: (data: object) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: object) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  requestOtp: (data: object) => request('/api/auth/otp/request', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: object) => request('/api/auth/otp/verify', { method: 'POST', body: JSON.stringify(data) }),
};

// User
export const users = {
  me: () => request('/api/users/me'),
};

// Events
export const events = {
  list: () => request('/api/events'),
  get: (id: string) => request(`/api/events/${id}`),
  create: (data: object) => request('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/events/${id}`, { method: 'DELETE' }),
  listInvitees: (id: string) => request(`/api/events/${id}/invitees`),
  addInvitee: (id: string, data: object) => request(`/api/events/${id}/invitees`, { method: 'POST', body: JSON.stringify(data) }),
  sendInvites: (id: string) => request(`/api/events/${id}/invitees/send`, { method: 'POST' }),
};

// Templates
export const templates = {
  list: () => request('/api/templates'),
  get: (id: string) => request(`/api/templates/${id}`),
  create: (data: object) => request('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request(`/api/templates/${id}`, { method: 'DELETE' }),
};

// Payments
export const payments = {
  list: () => request('/api/payments'),
  record: (data: object) => request('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
};

// Public invite
export const publicInvite = {
  get: (id: string) => fetch(`${BASE}/public/invite/${id}`).then(r => r.json()),
  respond: (id: string, status: string) =>
    fetch(`${BASE}/public/invite/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(r => r.json()),
};
