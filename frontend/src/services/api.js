/**
 * API base URL:
 * - Local dev: empty string → Vite proxy routes /api → localhost:3001
 * - Production: VITE_API_URL=https://taskly-backend.vercel.app (set in Vercel)
 */
const BASE = import.meta.env.VITE_API_URL || '';

async function request(method, path, body) {
  const opts = {
    method,
    credentials: 'include',
    headers: {},
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE}${path}`, opts);
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const raw = data?.detail;
    const msg = typeof raw === 'string'
      ? raw
      : Array.isArray(raw)
        ? raw.map(e => e.msg ?? JSON.stringify(e)).join('; ')
        : data?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (username, display_name, password, avatar) =>
    request('POST', '/api/v1/auth/register', { username, display_name, password, avatar }),
  login: (username, password) =>
    request('POST', '/api/v1/auth/login', { username, password }),
  logout: () => request('POST', '/api/v1/auth/logout'),
  me: () => request('GET', '/api/v1/auth/me'),
  updateAvatar: (avatar) => request('PATCH', '/api/v1/auth/avatar', { avatar }),
};

// ── Tasks ───────────────────────────────────────────────────────────────────
export const tasksApi = {
  list: (filter = 'all') => request('GET', `/api/v1/tasks?filter=${filter}`),
  create: (description, due_date, tag = 'Others') =>
    request('POST', '/api/v1/tasks', { description, due_date: due_date || null, tag }),
  complete: (id) => request('PATCH', `/api/v1/tasks/${id}/complete`),
  reopen:   (id) => request('PATCH', `/api/v1/tasks/${id}/reopen`),
};

// ── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  users: (status) => {
    const params = status ? `?status=${status}` : '';
    return request('GET', `/api/v1/admin/users${params}`);
  },
  approveUser: (id) => request('PATCH', `/api/v1/admin/users/${id}/approve`),
  rejectUser: (id) => request('PATCH', `/api/v1/admin/users/${id}/reject`),
  tasks: (userId, filter = 'all') => {
    const params = new URLSearchParams({ filter });
    if (userId && userId !== 'all') params.set('userId', userId);
    return request('GET', `/api/v1/admin/tasks?${params}`);
  },
  createTask: (owner_id, description, due_date, tag = 'Others') =>
    request('POST', '/api/v1/admin/tasks', {
      owner_id,
      description,
      due_date: due_date || null,
      tag,
    }),
  bulkCreateTask: (owner_id, description, tag, dates) =>
    request('POST', '/api/v1/admin/tasks/bulk', { owner_id, description, tag, dates }),
  completeTask: (id) => request('PATCH', `/api/v1/admin/tasks/${id}/complete`),
  reopenTask:   (id) => request('PATCH', `/api/v1/admin/tasks/${id}/reopen`),
  deleteTask:   (id) => request('DELETE', `/api/v1/admin/tasks/${id}`),
};

// ── Meta ────────────────────────────────────────────────────────────────────
export const metaApi = {
  tags: () => request('GET', '/api/v1/tags'),
};
