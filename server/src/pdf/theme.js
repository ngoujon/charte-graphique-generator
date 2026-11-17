import { contrastRatio } from '../../../shared/contrastRatio.js';
import { mixHex, readableOn } from '../../../shared/colors.js';
import { parseColorInput } from '../../../shared/parseColorInput.js';
import { fontDisplayName } from '../../../shared/fonts.js';

/** Grille de mise en page A4 (en points). */
export const PAGE = {
  width: 595.28,
  height: 841.89,
  marginX: 52,
  marginTop: 50,
  marginBottom: 70,
};
PAGE.contentWidth = PAGE.width - PAGE.marginX * 2;

/** Échelle d'espacement (multiples de 4). */
export const SP = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

const ensureHex = (value, fallback) => parseColorInput(value) || fallback;

/**
 * Construit le thème du document à partir de la configuration :
 * couleurs dérivées (texte atténué, filets, fonds de carte), polices par rôle
 * et styles de texte réutilisables.
 */
export function createTheme(config, font) {
  const couleurs = config.couleurs || {};
  const bg = ensureHex(couleurs.clair, '#ffffff');
  const ink = ensureHex(couleurs.sombre, '#1a1a1a');
  const primary = ensureHex(couleurs.primaire, '#2563eb');
  const secondary = ensureHex(couleurs.secondaire, '#64748b');

  const accentText = (contrastRatio(primary, bg) ?? 0) >= 3 ? primary : ink;

  const c = {
    bg,
    ink,
    primary,
    secondary,
    muted: mixHex(ink, bg, 0.42),
    subtle: mixHex(ink, bg, 0.62),
    hairline: mixHex(ink, bg, 0.86),
    card: mixHex(ink, bg, 0.955),
    accentText,
    onPrimary: readableOn(primary, [bg, ink, '#ffffff', '#111111']),
    onSecondary: readableOn(secondary, [bg, ink, '#ffffff', '#111111']),
    onInk: readableOn(ink, [bg, '#ffffff']),
    danger: '#d92d20',
    success: '#079455',
    warning: '#b54708',
  };

  const typo = config.typographie || {};
  const ids = {
    title: typo.principale,
    body: typo.secondaire,
    accent: typo.tertiaire,
  };

  const f = {
    title: (w = 700, italic = false) => font(ids.title, w, italic),
    body: (w = 400, italic = false) => font(ids.body, w, italic),
    accent: (w = 400, italic = false) => font(ids.accent, w, italic),
  };

  const text = {
    display: { ...f.title(700), fontSize: 44, lineHeight: 1.08, color: ink },
    h1: { ...f.title(700), fontSize: 26, lineHeight: 1.15, color: ink },
    h2: { ...f.title(600), fontSize: 14, lineHeight: 1.25, color: ink },
    h3: { ...f.title(600), fontSize: 11, lineHeight: 1.3, color: ink },
    lead: { ...f.body(400), fontSize: 11, lineHeight: 1.55, color: c.muted },
    body: { ...f.body(400), fontSize: 9.5, lineHeight: 1.55, color: ink },
    small: { ...f.body(400), fontSize: 8, lineHeight: 1.45, color: c.muted },
    eyebrow: { ...f.body(600), fontSize: 7.5, letterSpacing: 1.4, textTransform: 'uppercase', color: accentText },
    label: { ...f.body(600), fontSize: 6.8, letterSpacing: 1, textTransform: 'uppercase', color: c.muted },
    value: { ...f.accent(500), fontSize: 8.5, color: ink },
  };

  return {
    c,
    f,
    text,
    ids,
    names: {
      title: fontDisplayName(ids.title),
      body: fontDisplayName(ids.body),
      accent: fontDisplayName(ids.accent),
    },
  };
}
