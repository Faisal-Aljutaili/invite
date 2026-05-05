import type { AuthResponse, UserProfile, EventData, InviteeData, TemplateData, PaymentData, PublicInviteData } from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

class ApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
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
    const body = await res.json().catch(() => ({ error: res.statusText, code: 'UNKNOWN' }));
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
      throw new ApiError('Session expired. Please sign in again.', 'UNAUTHORIZED');
    }
    throw new ApiError(body.error || 'Request failed', body.code || 'UNKNOWN');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const auth = {
  register: (data: object) => request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: object) => request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  requestOtp: (data: object) => request<{ message: string }>('/api/auth/otp/request', { method: 'POST', body: JSON.stringify(data) }),
  verifyOtp: (data: object) => request<AuthResponse>('/api/auth/otp/verify', { method: 'POST', body: JSON.stringify(data) }),
};

// User
export const users = {
  me: () => request<UserProfile>('/api/users/me'),
};

// Events
export const events = {
  list: () => request<EventData[]>('/api/events'),
  get: (id: string) => request<EventData>(`/api/events/${id}`),
  create: (data: object) => request<EventData>('/api/events', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/events/${id}`, { method: 'DELETE' }),
  listInvitees: (id: string) => request<InviteeData[]>(`/api/events/${id}/invitees`),
  addInvitee: (id: string, data: object) => request<InviteeData>(`/api/events/${id}/invitees`, { method: 'POST', body: JSON.stringify(data) }),
  sendInvites: (id: string) => request<{ message: string }>(`/api/events/${id}/invitees/send`, { method: 'POST' }),
};

// Templates
export const templates = {
  list: () => request<TemplateData[]>('/api/templates'),
  get: (id: string) => request<TemplateData>(`/api/templates/${id}`),
  create: (data: object) => request<TemplateData>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) => request<void>(`/api/templates/${id}`, { method: 'DELETE' }),
};

// Payments
export const payments = {
  list: () => request<PaymentData[]>('/api/payments'),
  record: (data: object) => request<PaymentData>('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
};

// Public invite (no auth)
async function publicRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const publicInvite = {
  get: (id: string) => publicRequest<PublicInviteData>(`/public/invite/${id}`),
  respond: (id: string, status: string) =>
    publicRequest<InviteeData>(`/public/invite/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};
