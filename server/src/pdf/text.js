const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Typographie française : espaces insécables avant : ; ! ? » et après «. */
export function frTypo(text) {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/\s+([:;!?»%])/g, '\u00A0$1')
    .replace(/«\s+/g, '«\u00A0')
    .replace(/'/g, '’')
    .trim();
}

/** Découpe une liste saisie librement (« A, B ; C ») en éléments propres. */
export function splitList(value) {
  return String(value || '')
    .split(/[,;\n•·]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
