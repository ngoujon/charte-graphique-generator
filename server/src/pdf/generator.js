/**
 * Générateur de charte graphique (PDF A4).
 *
 * Le document est assemblé à partir de pages indépendantes (dossier `pages/`)
 * qui partagent un thème commun (`theme.js`) : grille de 8 pt, marges constantes,
 * hiérarchie typographique stricte et couleurs dérivées de la palette de la marque.
 */

import React from 'react';
import path from 'path';
import { Document, renderToFile, renderToBuffer } from '@react-pdf/renderer';
import { normalizeSections } from '../../../shared/config.js';
import { prepareFonts } from './fonts.js';
import { loadImage } from './images.js';
import { createTheme } from './theme.js';
import { coverPage, backCoverPage } from './pages/cover.js';
import { tocPage } from './pages/toc.js';
import { brandPage } from './pages/brand.js';
import { logoVariantsPage, logoRulesPage } from './pages/logo.js';
import { colorsPage, colorDetailsPage } from './pages/colors.js';
import { typeFamiliesPage, typeScalePage } from './pages/typography.js';
import { uiKitPage, uiKitPage2 } from './pages/uikit.js';
import { graphicsPage, chunkImages } from './pages/graphics.js';
import { aboutPage } from './pages/about.js';

const LOGO_TYPES = ['clair', 'sombre', 'primaire', 'secondaire'];
const LOGO_HINTS = {
  clair: /clair|light|claire/i,
  sombre: /sombre|dark|noir|white|blanc/i,
  primaire: /primaire|primary|principale/i,
  secondaire: /secondaire|secondary/i,
};

/** Sépare les logos (logo-<type>-*, ou « logo… » nommés explicitement) des autres images. */
export function splitLogos(images) {
  const logos = {};
  const used = new Set();
  for (const type of LOGO_TYPES) {
    const exact = images.find((i) => i.name.startsWith(`logo-${type}-`));
    if (exact) {
      logos[type] = exact;
      used.add(exact);
    }
  }
  for (const type of LOGO_TYPES) {
    if (logos[type]) continue;
    const hinted = images.find((i) => !used.has(i) && /^logo/i.test(i.name) && LOGO_HINTS[type].test(i.name));
    if (hinted) {
      logos[type] = hinted;
      used.add(hinted);
    }
  }
  if (!logos.clair) {
    const generic = images.find((i) => !used.has(i) && /^logo/i.test(i.name));
    if (generic) {
      logos.clair = generic;
      used.add(generic);
    }
  }
  return { logos, others: images.filter((i) => !used.has(i)) };
}

async function loadImages(paths) {
  const images = [];
  for (const p of paths) {
    try {
      images.push(await loadImage(p));
    } catch (e) {
      console.warn('[pdf] Image ignorée :', path.basename(p), e.message);
    }
  }
  return images;
}

const SECTION_DEFS = [
  {
    key: 'marque',
    label: 'Identité',
    description: 'Signature, mission, valeurs et personnalité',
    enabled: (ctx) => ['slogan', 'mission', 'valeurs', 'personnalite', 'recherche'].some((k) => String(ctx.marque[k] || '').trim()),
    pages: (ctx, s) => [brandPage(ctx, s)] },
  { key: 'logo', label: 'Logo', description: 'Déclinaisons et règles d’utilisation', pages: (ctx, s) => [logoVariantsPage(ctx, s), logoRulesPage(ctx, s)] },
  { key: 'couleurs', label: 'Couleurs', description: 'Palette, nuances et accessibilité', pages: (ctx, s) => [colorsPage(ctx, s), colorDetailsPage(ctx, s)] },
  { key: 'typographie', label: 'Typographie', description: 'Familles de caractères et hiérarchie', pages: (ctx, s) => [typeFamiliesPage(ctx, s), typeScalePage(ctx, s)] },
  { key: 'kitUi', label: 'Interface', description: 'Composants et exemples de mise en page', pages: (ctx, s) => [uiKitPage(ctx, s), uiKitPage2(ctx, s)] },
  {
    key: 'elementsGraphiques',
    label: 'Éléments graphiques',
    description: 'Motifs, pictogrammes et visuels',
    enabled: (ctx) => ctx.graphics.length > 0,
    pages: (ctx, s) => {
      const chunks = chunkImages(ctx.graphics);
      return chunks.map((imgs, i) => graphicsPage(ctx, s, imgs, i, chunks.length));
    },
  },
  { key: 'aboutQwebty', label: 'À propos', description: 'Qwebty, studio digital', pages: (ctx, s) => [aboutPage(ctx, s)] },
];

/** Construit l'arbre React du document. */
export async function buildDocument(config, imagePaths, { qwebtyLogoPath = null, fontsDir = null } = {}) {
  const typo = config.typographie || {};
  const font = await prepareFonts([typo.principale, typo.secondaire, typo.tertiaire], fontsDir);
  const t = createTheme(config, font);

  const images = await loadImages(imagePaths);
  const { logos, others } = splitLogos(images);
  let qwebtyLogo = null;
  if (qwebtyLogoPath) {
    qwebtyLogo = await loadImage(qwebtyLogoPath).catch(() => null);
  }

  const ctx = {
    config,
    t,
    projet: config.projet || {},
    marque: config.marque || {},
    logos,
    graphics: others,
    qwebtyLogo,
  };

  const enabled = normalizeSections(config.sections);
  const active = SECTION_DEFS.filter((d) => enabled[d.key] && (!d.enabled || d.enabled(ctx)));

  // Couverture (1) + sommaire (2), puis les sections dans l'ordre.
  let pageNum = 2;
  const sectionPages = [];
  const pageMap = { cover: 1, toc: 2 };
  const tocEntries = [];
  active.forEach((def, i) => {
    const section = { num: String(i + 1).padStart(2, '0'), label: def.label };
    const pages = def.pages(ctx, section);
    tocEntries.push({ num: section.num, label: def.label, description: def.description, page: pageNum + 1 });
    pageMap[def.key] = pageNum + 1;
    pageNum += pages.length;
    sectionPages.push(...pages);
  });

  const projet = ctx.projet;
  const doc = React.createElement(
    Document,
    {
      title: `${projet.nom || 'Charte graphique'} — Charte graphique`,
      author: projet.auteur || 'Qwebty',
      subject: 'Charte graphique',
      keywords: ['charte graphique', projet.nom, projet.reference].filter(Boolean).join(', '),
      creator: 'Charte Graphique Generator — Qwebty',
      producer: 'Qwebty',
      language: 'fr-FR',
      pageMode: 'useOutlines',
    },
    coverPage(ctx),
    tocPage(ctx, tocEntries),
    ...sectionPages,
    backCoverPage(ctx)
  );
  return { doc, pageMap };
}

/** Génère le PDF dans un fichier. */
export async function generatePdf(config, imagePaths, outputPath, opts = {}) {
  const { doc } = await buildDocument(config, imagePaths, opts);
  await renderToFile(doc, outputPath);
}

/** Génère le PDF en mémoire (aperçu) et renvoie aussi la page de début de chaque section. */
export async function generatePdfBuffer(config, imagePaths, opts = {}) {
  const { doc, pageMap } = await buildDocument(config, imagePaths, opts);
  const buffer = await renderToBuffer(doc);
  return { buffer, pageMap };
}
