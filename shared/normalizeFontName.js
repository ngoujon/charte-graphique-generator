export function normalizeFontName(name) {
  return String(name || '').replace(/-[0-9]+$/, '').replace(/[-_\s]/g, '').toLowerCase();
}
