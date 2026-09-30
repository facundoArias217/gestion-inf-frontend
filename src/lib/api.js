const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let token = null;

export function setToken(nuevoToken) {
  token = nuevoToken ?? null;
}

function tokenHeader() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const { headers = {}, ...resto } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...tokenHeader(), ...headers },
    ...resto,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Error ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  get: (path, options = {}) => request(path, options),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => request(path, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
