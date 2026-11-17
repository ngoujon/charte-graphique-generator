import { useEffect } from 'react';
import { CATALOG_FONTS, catalogFontFile } from '@shared/fonts.js';
import { API } from '../services/api';

const STYLE_ID = 'charte-font-faces';

/**
 * Déclare les @font-face des polices du catalogue et des polices importées,
 * pour que l'aperçu dans l'interface utilise exactement les mêmes fichiers que le PDF.
 * Le navigateur ne télécharge un fichier que lorsque la police est réellement affichée.
 */
export function useFontFaces(customFonts) {
  useEffect(() => {
    const rules = [];
    for (const font of CATALOG_FONTS) {
      for (const weight of font.weights) {
        rules.push(
          `@font-face{font-family:"${font.id}";font-weight:${weight};font-style:normal;font-display:swap;src:url("${API}/fonts/catalog/${catalogFontFile(font, weight)}") format("woff");}`
        );
      }
    }
    for (const f of customFonts || []) {
      if (!f?.filename) continue;
      rules.push(
        `@font-face{font-family:"${f.id}";font-display:swap;src:url("${API}/fonts/file/${encodeURIComponent(f.filename)}");}`
      );
    }
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = rules.join('\n');
  }, [customFonts]);
}

/** Pile CSS d'une police (avec repli selon la catégorie). */
export function cssFontStack(id) {
  if (!id) return 'inherit';
  if (id === 'Times-Roman') return '"Times New Roman", Times, serif';
  if (id === 'Courier') return '"Courier New", Courier, monospace';
  if (id === 'Helvetica') return 'Helvetica, Arial, sans-serif';
  const font = CATALOG_FONTS.find((f) => f.id === id);
  const fallback = font?.category === 'serif' ? 'serif' : font?.category === 'mono' ? 'monospace' : 'sans-serif';
  return `"${id}", ${fallback}`;
}
