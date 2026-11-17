export const API = '/api';

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, { cache: 'no-store', ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error || `Erreur ${res.status}`;
    throw new Error(msg);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res;
}

export function postJson(path, body) {
  return apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function isLogoFile(name) {
  return /^logo-(clair|sombre|primaire|secondaire)-/i.test(name);
}

export function filterGeneralInputFiles(files) {
  return (files || []).filter((f) => !isLogoFile(f.name));
}

/** Déclenche le téléchargement d'un fichier à partir d'une URL. */
export function downloadUrl(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Récupère une réponse binaire et la télécharge (nom tiré de Content-Disposition). */
export async function downloadResponse(res, fallbackName) {
  const disposition = res.headers.get('Content-Disposition');
  const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1] || fallbackName;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** URL d'un fichier d'entrée (logo, image). */
export function inputFileUrl(file) {
  return `${API}/input/files/${encodeURIComponent(file.name)}?t=${encodeURIComponent(file.modified || '')}`;
}
