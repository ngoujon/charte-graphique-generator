import { createRequire } from 'module';
import fs from 'fs/promises';
import path from 'path';
import { Font } from '@react-pdf/renderer';
import {
  CATALOG_FONTS,
  STANDARD_FONTS,
  getCatalogFont,
  catalogFontFile,
} from '../../../shared/fonts.js';

const require = createRequire(import.meta.url);

/** Pas de césure automatique (les règles anglaises de react-pdf coupent mal le français). */
Font.registerHyphenationCallback((word) => [word]);

const registered = new Set();

/** Variantes des 14 polices PDF standard (pas de fontWeight : familles distinctes). */
const STANDARD_VARIANTS = {
  Helvetica: { regular: 'Helvetica', bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique', boldItalic: 'Helvetica-BoldOblique' },
  'Times-Roman': { regular: 'Times-Roman', bold: 'Times-Bold', italic: 'Times-Italic', boldItalic: 'Times-BoldItalic' },
  Courier: { regular: 'Courier', bold: 'Courier-Bold', italic: 'Courier-Oblique', boldItalic: 'Courier-BoldOblique' },
};

/** Dossier `files/` d'un paquet @fontsource, ou null s'il est absent. */
export function catalogFilesDir(font) {
  try {
    const pkgJson = require.resolve(`@fontsource/${font.pkg}/package.json`);
    return path.join(path.dirname(pkgJson), 'files');
  } catch {
    return null;
  }
}

function registerCatalogFont(font) {
  if (registered.has(font.id)) return true;
  const dir = catalogFilesDir(font);
  if (!dir) return false;
  const sources = [];
  for (const weight of font.weights) {
    sources.push({ src: path.join(dir, catalogFontFile(font, weight)), fontWeight: weight });
    if (font.italic && weight === 400) {
      sources.push({ src: path.join(dir, catalogFontFile(font, weight, 'italic')), fontWeight: weight, fontStyle: 'italic' });
    }
  }
  Font.register({ family: font.id, fonts: sources });
  registered.add(font.id);
  return true;
}

async function registerCustomFont(id, fontsDir) {
  if (registered.has(id) || !fontsDir) return registered.has(id);
  const suffix = id.replace('custom:', '');
  const files = await fs.readdir(fontsDir).catch(() => []);
  const file = files.find((f) => path.basename(f, path.extname(f)) === suffix);
  if (!file) return false;
  Font.register({ family: id, src: path.resolve(fontsDir, file) });
  registered.add(id);
  return true;
}

/**
 * Enregistre les polices utilisées et renvoie un résolveur de styles :
 * `font(id, weight, italic)` → { fontFamily, fontWeight, fontStyle }.
 */
export async function prepareFonts(ids, fontsDir) {
  const available = new Map();
  for (const id of new Set(ids.filter(Boolean))) {
    const catalog = getCatalogFont(id);
    if (catalog) {
      if (registerCatalogFont(catalog)) available.set(id, { weights: catalog.weights, italic: catalog.italic });
    } else if (id.startsWith('custom:')) {
      if (await registerCustomFont(id, fontsDir)) available.set(id, { weights: [400], italic: false, single: true });
    } else if (STANDARD_FONTS.some((f) => f.id === id)) {
      available.set(id, { weights: [400, 700], italic: true, standard: true });
    }
  }

  const resolve = (id) => (available.has(id) ? id : 'Helvetica');

  return function font(id, weight = 400, italic = false) {
    const family = resolve(id);
    const info = available.get(family) || { weights: [400, 700], italic: true, standard: true };
    if (info.standard) {
      const v = STANDARD_VARIANTS[family] || STANDARD_VARIANTS.Helvetica;
      const bold = weight >= 600;
      return { fontFamily: bold ? (italic ? v.boldItalic : v.bold) : italic ? v.italic : v.regular };
    }
    if (info.single) {
      return { fontFamily: family };
    }
    const closest = info.weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), info.weights[0]);
    return {
      fontFamily: family,
      fontWeight: closest,
      fontStyle: italic && info.italic && closest === 400 ? 'italic' : 'normal',
    };
  };
}

export { CATALOG_FONTS };
