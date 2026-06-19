import path from 'path';

export function isSafeFilename(name) {
  if (!name || typeof name !== 'string') return false;
  if (name.includes('..') || path.isAbsolute(name)) return false;
  if (name.includes('/') || name.includes('\\')) return false;
  return true;
}

export function assertSafeFilename(name, res) {
  if (!isSafeFilename(name)) {
    res.status(400).json({ error: 'Nom de fichier invalide' });
    return false;
  }
  return true;
}
