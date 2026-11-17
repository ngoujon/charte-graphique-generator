import { contrastRatio } from './contrastRatio.js';

export function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}

/** Conversion RGB → CMJN naïve (sans profil ICC) : valeurs indicatives, en %. */
export function hexToCmyk(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const k = 1 - Math.max(r, g, b);
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);
  return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}

export function formatRgb(hex) {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb.r} · ${rgb.g} · ${rgb.b}` : '';
}

export function formatCmyk(hex) {
  const c = hexToCmyk(hex);
  return c ? `${c.c} · ${c.m} · ${c.y} · ${c.k}` : '';
}

/** Mélange deux couleurs hex (amount = part de `b`, entre 0 et 1). */
export function mixHex(a, b, amount) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  return rgbToHex(
    ca.r + (cb.r - ca.r) * amount,
    ca.g + (cb.g - ca.g) * amount,
    ca.b + (cb.b - ca.b) * amount
  );
}

export function lightenHex(hex, amount = 0.2) {
  return mixHex(hex, '#ffffff', amount);
}

export function darkenHex(hex, amount = 0.2) {
  return mixHex(hex, '#000000', amount);
}

export function hexToRgba(hex, alpha = 0.15) {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : 'rgba(0,0,0,0.1)';
}

/** Luminance perçue (0 = noir, 1 = blanc). */
export function perceivedLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
}

export function isLightColor(hex) {
  return perceivedLuminance(hex) > 0.6;
}

/**
 * Couleur de texte la plus lisible sur un fond donné, parmi des candidates
 * (par défaut : blanc et noir profond).
 */
export function readableOn(bg, candidates = ['#ffffff', '#111111']) {
  let best = candidates[0];
  let bestRatio = -1;
  for (const c of candidates) {
    const r = contrastRatio(bg, c) ?? 0;
    if (r > bestRatio) {
      bestRatio = r;
      best = c;
    }
  }
  return best;
}

/** Échelle de nuances (du plus clair au plus foncé) autour d'une couleur de base. */
export const TINT_STEPS = [
  { key: '50', mix: '#ffffff', amount: 0.9 },
  { key: '100', mix: '#ffffff', amount: 0.75 },
  { key: '300', mix: '#ffffff', amount: 0.45 },
  { key: '500', mix: null, amount: 0 },
  { key: '700', mix: '#000000', amount: 0.25 },
  { key: '900', mix: '#000000', amount: 0.5 },
];

export function tintScale(hex) {
  return TINT_STEPS.map(({ key, mix, amount }) => ({
    key,
    hex: mix ? mixHex(hex, mix, amount) : hex.toLowerCase(),
    base: !mix,
  }));
}
