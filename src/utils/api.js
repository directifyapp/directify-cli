import Conf from 'conf';

const config = new Conf({ projectName: 'directify-cli' });

const BASE_URL = 'https://directify.app/api';

export function getToken() {
  return config.get('token');
}

export function setToken(token) {
  config.set('token', token);
}

export function clearToken() {
  config.delete('token');
}

export function getDefaultDirectory() {
  return config.get('directory');
}

export function setDefaultDirectory(id) {
  config.set('directory', id);
}

export function resolveDirectory(opts) {
  const dir = opts.directory || getDefaultDirectory();
  if (!dir) {
    throw new Error(
      'No directory specified. Use --directory <id> or set a default with: directify config set-directory <id>'
    );
  }
  return dir;
}

async function request(method, path, body = null) {
  const token = getToken();
  if (!token) {
    throw new Error('Not authenticated. Run: directify auth login <token>');
  }

  const url = `${BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const options = { method, headers };
  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);

  if (res.status === 401) {
    throw new Error('Authentication failed. Check your token with: directify auth login <token>');
  }
  if (res.status === 403) {
    throw new Error('Access denied. You do not have permission to access this resource.');
  }
  if (res.status === 404) {
    throw new Error('Resource not found.');
  }
  if (res.status === 422) {
    const data = await res.json();
    const errors = data.errors
      ? Object.entries(data.errors)
          .map(([field, msgs]) => `  ${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n')
      : data.message || 'Validation failed';
    throw new Error(`Validation error:\n${errors}`);
  }
  if (res.status === 429) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again (limit: 120 requests/minute).');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error (${res.status}): ${text || res.statusText}`);
  }

  if (res.status === 204) return null;

  return res.json();
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
};
