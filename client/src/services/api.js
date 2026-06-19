export const API = '/api';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, { cache: 'no-store', ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error || (await res.text().catch(() => '')) || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res;
}

export function formatSize(bytes) {
  return bytes < 1024 ? `${bytes} o` : `${(bytes / 1024).toFixed(1)} Ko`;
}

export function isLogoFile(name) {
  return /^logo-(clair|sombre|primaire|secondaire)-/i.test(name);
}

export function filterGeneralInputFiles(files) {
  return (files || []).filter((f) => !isLogoFile(f.name));
}
