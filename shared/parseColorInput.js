export function parseColorInput(str) {
  const s = (str || '').trim();
  const hex6 = s.replace(/^#/, '').match(/^([0-9a-fA-F]{6})$/);
  if (hex6) return `#${hex6[1].toLowerCase()}`;
  const hex3 = s.replace(/^#/, '').match(/^([0-9a-fA-F]{3})$/);
  if (hex3) return `#${hex3[1].replace(/(.)/g, '$1$1').toLowerCase()}`;
  const rgbMatch = s.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return null;
}
