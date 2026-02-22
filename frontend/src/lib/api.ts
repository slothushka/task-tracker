import { AuthResponse, TasksResponse, TaskResponse, TaskFilters } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Token helpers (client-side only) ──────────────────────────────────────
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// ── Base fetch wrapper ─────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

// ── Auth API ───────────────────────────────────────────────────────────────
export const authApi = {
  signup: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Tasks API ──────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.sort) params.set('sort', filters.sort);
    const qs = params.toString();
    return apiFetch<TasksResponse>(`/api/tasks${qs ? `?${qs}` : ''}`, {}, true);
  },

  create: (data: { title: string; description?: string; status?: string; dueDate?: string }) =>
    apiFetch<TaskResponse>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),

  update: (id: string, data: Partial<{ title: string; description: string; status: string; dueDate: string }>) =>
    apiFetch<TaskResponse>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),

  delete: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    }, true),
};
