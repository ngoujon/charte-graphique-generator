/**
 * Générateur de charte graphique
 * Respecte les 13 principes du design graphique (Figma)
 * https://www.figma.com/fr-fr/resource-library/principes-du-design-graphique/
 *
 * 1. Alignement - Grille 8px, alignement cohérent
 * 2. Contraste - Hiérarchie visuelle par taille/couleur
 * 3. Équilibre - Répartition symétrique des éléments
 * 4. Hiérarchie - Titre > sous-titre > corps
 * 5. Couleur - Palette de la charte
 * 6. Espace blanc - Marges, padding, respiration
 * 7. Proportion - Ratios cohérents (1.5)
 * 8. Répétition - Espacements, grille, styles
 * 9. Rythme - Espacement régulier (8, 16, 24, 32)
 * 10. Mouvement - Ordre de lecture (Z)
 * 11. Mise en valeur - Points focaux
 * 12. Proximité - Regroupement par thème
 * 13. Unité - Cohérence globale
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToFile,
} from '@react-pdf/renderer';
import fs from 'fs/promises';
import path from 'path';
import { QWEBTY } from './qwebty-brand.js';

const SP = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const BORDER = '#e2e8f0';
const CARD_BG = '#f8fafc';
const MUTED = QWEBTY.colors.texteMuted || '#64748b';

const BUILTIN_FONT_FAMILIES = {
  Helvetica: { regular: 'Helvetica', bold: 'Helvetica-Bold', thin: 'Helvetica-Oblique' },
  'Times-Roman': { regular: 'Times-Roman', bold: 'Times-Bold', thin: 'Times-Italic' },
  Courier: { regular: 'Courier', bold: 'Courier-Bold', thin: 'Courier-Oblique' },
};

const FONT_FORMATS = { '.ttf': 'truetype', '.otf': 'truetype', '.woff': 'woff' };

const TYPO_SIZES = { titre: 24, sousTitre: 18, corps: 12 };
const EXEMPLE_TITRE = "Titre de l'exemple";
const EXEMPLE_SOUS_TITRE = "Sous-titre de l'exemple";
const EXEMPLE_LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

const styles = StyleSheet.create({
  page: {
    padding: SP.xl,
    fontFamily: 'Helvetica',
  },
  cover: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: SP.xxl,
  },
  coverHeader: {
    alignItems: 'center',
  },
  coverMain: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SP.xl,
  },
  coverProjectName: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
    marginBottom: SP.sm,
    textAlign: 'center',
  },
  coverDocumentTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica',
    color: MUTED,
    marginBottom: SP.lg,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: MUTED,
    textAlign: 'center',
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: SP.sm,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  coverQwebtyText: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: MUTED,
    textAlign: 'left',
  },
  aboutPage: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: SP.xxl,
  },
  aboutHeader: {
    alignItems: 'flex-start',
  },
  aboutMain: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingVertical: SP.xl,
  },
  aboutTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    marginBottom: SP.lg,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'left',
  },
  aboutText: {
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    textAlign: 'justify',
    lineHeight: 1.7,
    alignSelf: 'stretch',
  },
  section: {
    marginBottom: SP.lg,
  },
  sectionHeader: {
    marginBottom: SP.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    lineHeight: 1.4,
    paddingBottom: SP.md,
    marginBottom: 0,
    borderBottomWidth: 2,
  },
  sectionIntro: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: MUTED,
    marginTop: SP.sm,
    marginBottom: SP.lg,
    lineHeight: 1.5,
  },
  marqueItem: {
    marginBottom: SP.lg,
  },
  colorRow: {
    flexDirection: 'row',
    gap: SP.md,
    marginBottom: SP.sm,
    flexWrap: 'wrap',
  },
  colorBox: {
    width: 88,
    height: 48,
    borderRadius: 6,
    marginBottom: SP.sm,
  },
  paletteGrid: {
    flexDirection: 'column',
    gap: SP.lg,
    marginTop: SP.xl,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: SP.lg,
  },
  paletteCard: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  paletteCardSwatch: {
    height: 100,
  },
  paletteCardSwatchBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  paletteCardBody: {
    padding: SP.sm,
    backgroundColor: '#ffffff',
  },
  paletteCardName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  paletteCardHex: {
    fontSize: 10,
    fontFamily: 'Courier',
    color: MUTED,
    letterSpacing: 0.5,
  },
  colorLabel: {
    fontSize: 10,
    color: MUTED,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.md,
    marginTop: SP.md,
  },
  imageItem: {
    width: 120,
    alignItems: 'center',
  },
  img: {
    width: 100,
    height: 100,
    objectFit: 'contain',
  },
  logoBox: {
    width: 160,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SP.md,
    borderRadius: 8,
    marginBottom: SP.sm,
  },
  logoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.lg,
    marginTop: SP.md,
  },
  logoGridItem: {
    width: 245,
    alignItems: 'center',
  },
  logoBoxCompact: {
    width: 220,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SP.sm,
    borderRadius: 8,
    marginBottom: SP.xs,
  },
  logoImgCompact: {
    maxWidth: 200,
    maxHeight: 80,
    objectFit: 'contain',
  },
  logoImg: {
    maxWidth: 140,
    maxHeight: 90,
    objectFit: 'contain',
  },
  typoExample: {
    marginBottom: SP.md,
  },
  typoSpecsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.lg,
    padding: SP.lg,
    marginBottom: SP.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  typoSpecItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SP.sm,
  },
  typoSpecLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: MUTED,
  },
  typoSpecValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  numbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SP.sm,
    marginTop: SP.sm,
  },
  numberBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
  },
  typoLevelCard: {
    padding: SP.md,
    marginBottom: SP.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  placeholderLogo: {
    width: 120,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  placeholderLogoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  alphabetRow: {
    marginBottom: SP.sm,
    flexWrap: 'wrap',
  },
  articleBlock: {
    marginTop: SP.md,
    padding: SP.lg,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: CARD_BG,
  },
  articleBlockWithAccent: {
    flexDirection: 'row',
    marginTop: SP.md,
  },
  articleBlockAccentBar: {
    width: 4,
    marginRight: SP.md,
    borderRadius: 2,
  },
  uiButton: {
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderRadius: 6,
    marginRight: SP.sm,
    marginBottom: SP.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uiButtonSmall: {
    paddingVertical: 4,
    paddingHorizontal: SP.sm,
    borderRadius: 4,
    fontSize: 10,
  },
  uiInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 10,
    fontSize: 12,
  },
  uiDropZone: {
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 8,
    padding: SP.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  uiNumberStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    overflow: 'hidden',
  },
  uiNumberBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  uiNumberBtnLast: {
    borderRightWidth: 0,
    borderLeftWidth: 1,
    borderLeftColor: BORDER,
  },
  uiNumberValue: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SP.sm,
  },
  uiCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: SP.md,
    marginBottom: SP.md,
  },
  uiBadge: {
    paddingVertical: SP.xs,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  uiBlock: {
    marginBottom: SP.md,
  },
  uiBlockTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: MUTED,
    marginBottom: SP.xs,
  },
  uiAlert: {
    padding: SP.sm,
    borderRadius: 8,
    marginBottom: SP.xs,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  uiLink: {
    textDecoration: 'underline',
    fontSize: 12,
  },
  uiTable: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: 'hidden',
  },
  uiTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  uiTableHeader: {
    backgroundColor: CARD_BG,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
  },
  uiTableCell: {
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    flex: 1,
  },
  uiProgress: {
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER,
    overflow: 'hidden',
    marginBottom: SP.sm,
  },
  uiProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  uiLoaderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: BORDER,
  },
  uiCheckbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: BORDER,
    borderRadius: 4,
    marginRight: SP.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uiListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SP.sm,
  },
  qwebtyLogo: {
    paddingVertical: SP.xs,
    paddingHorizontal: SP.sm,
    borderRadius: 6,
    backgroundColor: MUTED,
  },
  qwebtyLogoImg: {
    height: 40,
    width: 'auto',
    objectFit: 'contain',
  },
  qwebtyLogoImgFooter: {
    height: 16,
    width: 'auto',
    objectFit: 'contain',
  },
  qwebtyLogoText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  qwebtyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SP.xs,
    marginTop: SP.sm,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  qwebtyFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SP.xs,
  },
  qwebtyFooterText: {
    fontSize: 8,
    color: MUTED,
    fontFamily: 'Helvetica',
  },
  qwebtyFooterBrand: {
    fontSize: 8,
    color: MUTED,
    fontFamily: 'Helvetica-Bold',
  },
  pageContentWrapper: {
    flex: 1,
    flexGrow: 1,
    minHeight: 0,
  },
});

function createQwebtyFooter(pageNum, totalPages, logoSrc) {
  const isLastPage = pageNum === totalPages;
  const displayLogo = isLastPage && logoSrc;
  const logoContent = displayLogo
    ? React.createElement(Image, { src: logoSrc, style: styles.qwebtyLogoImgFooter })
    : React.createElement(Text, { style: styles.qwebtyFooterBrand, children: QWEBTY.name });
  return React.createElement(
    View,
    { key: 'qwebty-footer', style: styles.qwebtyFooter },
    React.createElement(
      View,
      { style: styles.qwebtyFooterLeft },
      logoContent,
      React.createElement(Text, { style: styles.qwebtyFooterText, children: QWEBTY.url })
    ),
    React.createElement(Text, { style: styles.qwebtyFooterText, children: QWEBTY.tagline }),
    React.createElement(Text, { style: styles.qwebtyFooterText, children: `Page ${pageNum}/${totalPages}` })
  );
}

function wrapPageContent(content, pageNum, totalPages, logoSrc) {
  return React.createElement(
    View,
    { style: { flex: 1 } },
    React.createElement(View, { key: 'content', style: styles.pageContentWrapper }, content),
    createQwebtyFooter(pageNum, totalPages, logoSrc)
  );
}

function createSectionHeader(num, title, headerStyle) {
  const titleColor = '#1a1a1a';
  return React.createElement(
    View,
    { style: mergeStyles(styles.sectionHeader, headerStyle) },
    React.createElement(Text, {
      style: mergeStyles(styles.sectionTitle, { color: titleColor, borderBottomColor: titleColor }),
      children: `${num}. ${title}`,
    })
  );
}

function createPlaceholderLogo(bgColor, textColor) {
  return React.createElement(
    View,
    {
      style: mergeStyles(styles.placeholderLogo, {
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: textColor,
      }),
    },
    React.createElement(Text, {
      style: mergeStyles(styles.placeholderLogoText, { color: textColor }),
      children: 'LOGO',
    })
  );
}

async function imageToBase64(filePath) {
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/png';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function mergeStyles(...args) {
  return Object.assign({}, ...args.filter(Boolean));
}

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function hexToRgba(hex, alpha = 0.15) {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : 'rgba(0,0,0,0.1)';
}

function getHexLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => v / 255);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
}

function lightenHex(hex, amount = 0.2) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount
  );
}

function darkenHex(hex, amount = 0.2) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount));
}

function formatDateFr(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function findLogos(images) {
  const clair = images.find((i) =>
    /clair|light|claire/i.test(i.name)
  );
  const sombre = images.find((i) =>
    /sombre|dark|noir/i.test(i.name)
  );
  const primaire = images.find((i) =>
    /primaire|primary|principale/i.test(i.name)
  );
  const secondaire = images.find((i) =>
    /secondaire|secondary/i.test(i.name)
  );
  const first = images[0];
  const second = images[1];
  return {
    clair: clair || first,
    sombre: sombre || second || first,
    primaire: primaire || sombre || second || first,
    secondaire: secondaire || sombre || second || first,
    hasPrimaire: !!primaire,
    hasSecondaire: !!secondaire,
  };
}

export async function generatePdf(config, imagePaths, outputPath, logoPath = null, dataDir = null) {
  const colors = config.couleurs || {};
  const projet = config.projet || {};
  const typo = config.typographie || {};
  const fontsDir = dataDir ? path.join(dataDir, 'fonts') : null;

  let qwebtyLogoSrc = null;
  if (logoPath) {
    try {
      qwebtyLogoSrc = await imageToBase64(logoPath);
    } catch (e) {
      console.warn('Logo Qwebty non chargé:', e.message);
    }
  }

  const images = [];
  for (const p of imagePaths) {
    try {
      const src = await imageToBase64(p);
      images.push({ src, name: path.basename(p) });
    } catch (e) {
      console.warn('Skip image:', p, e.message);
    }
  }

  const { clair: logoClair, sombre: logoSombre, primaire: logoPrimaire, secondaire: logoSecondaire, hasPrimaire, hasSecondaire } = findLogos(images);
  const otherImages = images.filter(
    (i) => i !== logoClair && i !== logoSombre && i !== logoPrimaire && i !== logoSecondaire
  );

  const primaire = colors.primaire || '#2563eb';
  const secondaire = colors.secondaire || '#64748b';
  const fond = colors.clair || colors.fond || colors.blanc || '#ffffff';
  const texte = colors.sombre || colors.texte || colors.noir || '#1a1a1a';

  const colorEntries = [
    ['clair', fond],
    ['sombre', texte],
    ['primaire', primaire],
    ['secondaire', secondaire],
  ];

  const fontPrincipale = typo.principale || 'Helvetica';
  const fontSecondaire = typo.secondaire || 'Times-Roman';
  const fontTertiaire = typo.tertiaire || 'Courier';

  const FONT_FAMILIES = { ...BUILTIN_FONT_FAMILIES };

  if (fontsDir) {
    const usedCustom = [fontPrincipale, fontSecondaire, fontTertiaire].filter((f) => f?.startsWith('custom:'));
    try {
      const fontFiles = await fs.readdir(fontsDir).catch(() => []);
      for (const fontKey of usedCustom) {
        const suffix = fontKey.replace('custom:', '');
        const file = fontFiles.find((f) => path.basename(f, path.extname(f)) === suffix);
        if (file) {
          const ext = path.extname(file).toLowerCase();
          const fontFormat = FONT_FORMATS[ext] || 'truetype';
          const fontPath = path.resolve(path.join(fontsDir, file));
          try {
            Font.register({
              family: fontKey,
              src: fontPath,
              format: fontFormat,
            });
            FONT_FAMILIES[fontKey] = { regular: fontKey, bold: fontKey, thin: fontKey };
          } catch (e) {
            console.warn(`Police non enregistrée ${fontKey}:`, e.message);
          }
        }
      }
    } catch (e) {
      console.warn('Répertoire polices inaccessible:', e.message);
    }
  }

  const getFontVariants = (base) => FONT_FAMILIES[base] || BUILTIN_FONT_FAMILIES.Helvetica;

  const dateGen = projet.date || new Date().toISOString().slice(0, 10);
  const totalPagesCount = 11 + (otherImages.length > 0 ? 1 : 0);

  const dateFormatted = formatDateFr(dateGen) || dateGen;
  const qwebtyAccent = MUTED;

  const coverLogoContent = qwebtyLogoSrc
    ? React.createElement(
        View,
        { key: 'qwebty-logo', style: { alignItems: 'center' } },
        React.createElement(Image, {
          src: qwebtyLogoSrc,
          style: mergeStyles(styles.qwebtyLogoImg, { height: 36 }),
        })
      )
    : React.createElement(
        View,
        { key: 'qwebty-logo', style: { alignItems: 'center' } },
        React.createElement(Text, {
          style: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: MUTED, letterSpacing: 1 },
          children: QWEBTY.name,
        })
      );

  const coverContent = React.createElement(
    View,
    { style: styles.cover },
    React.createElement(View, { style: styles.coverHeader }, coverLogoContent),
    React.createElement(
      View,
      { style: styles.coverMain },
      React.createElement(Text, {
        style: mergeStyles(styles.coverProjectName, {
          fontFamily: getFontVariants(fontPrincipale).bold,
          color: colors.primaire || colors.texte || texte,
        }),
        children: projet.nom || 'Mon Projet',
      }),
      React.createElement(Text, {
        style: styles.coverDocumentTitle,
        children: 'Charte Graphique',
      }),
      React.createElement(Text, {
        style: styles.coverDate,
        children: dateFormatted,
      })
    ),
    React.createElement(
      View,
      { style: styles.coverFooter },
      React.createElement(Text, {
        style: styles.coverQwebtyText,
        children: QWEBTY.tagline,
      }),
      React.createElement(Text, {
        style: styles.coverQwebtyText,
        children: QWEBTY.url,
      })
    )
  );

  const pages = [];

  pages.push(
    React.createElement(
      Page,
      {
        key: 'cover',
        size: 'A4',
        style: mergeStyles(styles.page, { backgroundColor: fond }),
      },
      coverContent
    )
  );

  const sommaireItems = ['Présentation de la marque', 'Logo', 'Palette de couleurs', 'Typographie (principale, secondaire, tertiaire)', 'Kit UI'];
  if (otherImages.length > 0) sommaireItems.push('Éléments graphiques');

  const pageSommaire = React.createElement(
    Page,
    {
      key: 'sommaire',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(1, 'Sommaire'),
        ...sommaireItems.map((item, i) =>
          React.createElement(
            View,
            {
              key: i,
              style: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: SP.md,
                paddingVertical: SP.sm,
                borderBottomWidth: 1,
                borderBottomColor: BORDER,
              },
            },
            React.createElement(Text, {
              style: { fontSize: 11, color: qwebtyAccent, fontFamily: 'Helvetica-Bold', width: 24 },
              children: `${String(i + 2).padStart(2, '0')}`,
            }),
            React.createElement(Text, {
              style: { fontSize: 14, color: texte, fontFamily: 'Helvetica-Bold', flex: 1 },
              children: item,
            })
          )
        )
      ),
      2,
      totalPagesCount,
      qwebtyLogoSrc
    )
  );
  pages.push(pageSommaire);

  const marque = config.marque || {};
  const marqueFont = 'Helvetica';
  const marqueFields = [
    {
      key: 'nom',
      label: 'Nom de la marque',
      value: projet.nom || 'Mon Projet',
      style: { fontSize: 14, fontFamily: marqueFont, color: texte, lineHeight: 1.5 },
    },
    {
      key: 'slogan',
      label: 'Slogan',
      value: marque.slogan || '',
      style: { fontSize: 12, fontFamily: marqueFont, color: texte, lineHeight: 1.5 },
    },
    {
      key: 'mission',
      label: 'Mission',
      value: marque.mission || '',
      style: { fontSize: 11, fontFamily: marqueFont, color: texte, lineHeight: 1.6 },
    },
    {
      key: 'valeurs',
      label: 'Valeurs',
      value: marque.valeurs || '',
      style: { fontSize: 11, fontFamily: marqueFont, color: texte, lineHeight: 1.6 },
    },
    {
      key: 'presentation',
      label: 'Présentation',
      value: projet.description || '',
      style: { fontSize: 11, fontFamily: marqueFont, color: texte, lineHeight: 1.6 },
    },
    {
      key: 'personnalite',
      label: 'Personnalité',
      value: marque.personnalite || '',
      style: { fontSize: 11, fontFamily: marqueFont, color: texte, lineHeight: 1.6 },
    },
  ];

  const marqueItems = marqueFields
    .filter(({ value }) => value != null && String(value).trim() !== '')
    .map(({ key, label, value, style }) =>
      React.createElement(
        View,
        { key: `marque-${key}`, style: styles.marqueItem },
        React.createElement(Text, {
          style: { marginBottom: SP.xs, fontSize: 10, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase' },
          children: label,
        }),
        React.createElement(Text, {
          style: style,
          children: value,
        })
      )
    );

  const pageMarque = React.createElement(
    Page,
    {
      key: 'marque',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(2, 'Présentation de la marque'),
        React.createElement(Text, {
          style: mergeStyles(styles.sectionIntro),
          children: 'Identité et positionnement de la marque',
        }),
        ...marqueItems
      ),
      3,
      totalPagesCount,
      qwebtyLogoSrc
    )
  );
  pages.push(pageMarque);

  const logoSectionChildren = [];

  const logoImgStyle = styles.logoImgCompact;
  const logoBoxStyle = styles.logoBoxCompact;

  const logoVariants = [
    {
      key: 'clair',
      label: logoClair ? 'Logo clair (fond clair)' : 'Logo clair — Exemple',
      bgColor: fond || '#ffffff',
      border: true,
      content: logoClair
        ? React.createElement(Image, { src: logoClair.src, style: logoImgStyle })
        : createPlaceholderLogo(fond || '#ffffff', texte || '#1e293b'),
    },
    {
      key: 'sombre',
      label: logoSombre ? 'Logo sombre (fond sombre)' : 'Logo sombre — Exemple',
      bgColor: texte || '#1e293b',
      border: false,
      content: logoSombre
        ? React.createElement(Image, { src: logoSombre.src, style: logoImgStyle })
        : createPlaceholderLogo(texte || '#1e293b', fond || '#ffffff'),
    },
    {
      key: 'primaire',
      label: hasPrimaire ? 'Sur couleur principale' : 'Logo primaire — Exemple',
      bgColor: primaire,
      border: true,
      content: logoPrimaire
        ? React.createElement(Image, { src: logoPrimaire.src, style: logoImgStyle })
        : createPlaceholderLogo(primaire, '#ffffff'),
    },
    {
      key: 'secondaire',
      label: hasSecondaire ? 'Sur couleur secondaire' : 'Logo secondaire — Exemple',
      bgColor: secondaire,
      border: true,
      content: logoSecondaire
        ? React.createElement(Image, { src: logoSecondaire.src, style: logoImgStyle })
        : createPlaceholderLogo(secondaire, '#ffffff'),
    },
  ];

  const logoGridItems = logoVariants.map(({ key, label, bgColor, border, content }) =>
    React.createElement(
      View,
      { key: `${key}-wrap`, style: styles.logoGridItem },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, {
          marginBottom: SP.sm,
          fontSize: 10,
          fontFamily: 'Helvetica-Bold',
        }),
        children: label,
      }),
      React.createElement(
        View,
        {
          style: mergeStyles(logoBoxStyle, {
            backgroundColor: bgColor,
            ...(border && { borderWidth: 1, borderColor: BORDER }),
          }),
        },
        content
      )
    )
  );

  const pageLogo = React.createElement(
    Page,
    {
      key: 'logo',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(3, 'Logo — Déclinaisons'),
        React.createElement(Text, {
          style: mergeStyles(styles.sectionIntro),
          children: 'Versions claire, sombre, sur couleur principale et sur couleur secondaire',
        }),
        React.createElement(View, { style: styles.logoGrid }, ...logoGridItems)
      ),
      4,
      totalPagesCount,
      qwebtyLogoSrc
    )
  );

  pages.push(pageLogo);

  const paletteLabels = {
    clair: 'Fond',
    sombre: 'Texte',
    primaire: 'Principale',
    secondaire: 'Secondaire',
  };

  const paletteCards = colorEntries.map(([key, hex]) => {
    const label = paletteLabels[key] || key;
    const luminance = getHexLuminance(hex);
    const isLight = luminance > 0.6;
    const swatchBorder = isLight ? styles.paletteCardSwatchBorder : {};
    return React.createElement(
      View,
      { key: key, style: styles.paletteCard },
      React.createElement(View, {
        style: mergeStyles(styles.paletteCardSwatch, {
          backgroundColor: hex,
          ...swatchBorder,
        }),
      }),
      React.createElement(
        View,
        { style: styles.paletteCardBody },
        React.createElement(Text, {
          style: mergeStyles(styles.paletteCardName, { color: texte }),
          children: label,
        }),
        React.createElement(Text, {
          style: styles.paletteCardHex,
          children: hex,
        })
      )
    );
  });

  const pageCouleurs = React.createElement(
    Page,
    {
      key: 'couleurs',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(4, 'Palette de couleurs'),
        React.createElement(Text, {
          style: mergeStyles(styles.sectionIntro),
          children: 'Les 4 couleurs de la charte graphique',
        }),
        React.createElement(
          View,
          { style: styles.paletteGrid },
          React.createElement(View, { style: styles.paletteRow }, paletteCards[0], paletteCards[1]),
          React.createElement(View, { style: styles.paletteRow }, paletteCards[2], paletteCards[3])
        )
      ),
      5,
      totalPagesCount,
      qwebtyLogoSrc
    )
  );
  pages.push(pageCouleurs);

  const ALPHABET_MAJ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ALPHABET_MIN = 'abcdefghijklmnopqrstuvwxyz';
  const CHARS_SPECIAUX = '0123456789!@#$%^&*()_';

  const FONT_DISPLAY_NAMES = { Helvetica: 'Helvetica', 'Times-Roman': 'Times Roman', Courier: 'Courier' };
  const getFontDisplayName = (fontKey) => {
    if (FONT_DISPLAY_NAMES[fontKey]) return FONT_DISPLAY_NAMES[fontKey];
    if (fontKey?.startsWith('custom:')) {
      return fontKey.replace('custom:', '').replace(/-[0-9]+$/, '').replace(/-/g, ' ');
    }
    return fontKey || '';
  };
  const LABEL_TYPEFACE = { principale: 'Police principale', secondaire: 'Police secondaire', tertiaire: 'Police tertiaire' };

  const typoVariantLabelStyle = { fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, color: MUTED, marginBottom: SP.xs };

  const createFontPage = (fontKey, typeKey, pageNum) => {
    const variants = getFontVariants(fontKey);
    const fontName = getFontDisplayName(fontKey);
    const typeLabel = LABEL_TYPEFACE[typeKey] || '';

    const createVariantBlock = (variantKey, fontFamily, label) =>
      React.createElement(
        View,
        { key: variantKey, style: { marginBottom: SP.xl } },
        React.createElement(Text, { style: typoVariantLabelStyle, children: label }),
        React.createElement(Text, {
          style: { fontSize: 11, fontFamily: fontFamily, color: texte, lineHeight: 1.4 },
          children: `${ALPHABET_MAJ} ${ALPHABET_MIN} ${CHARS_SPECIAUX}`,
        }),
        React.createElement(
          View,
          { style: { marginTop: SP.sm } },
          React.createElement(Text, {
            style: { fontSize: 14, fontFamily: fontFamily, color: texte, marginBottom: 2 },
            children: EXEMPLE_TITRE,
          }),
          React.createElement(Text, {
            style: { fontSize: 11, fontFamily: fontFamily, color: secondaire, marginBottom: 4 },
            children: EXEMPLE_SOUS_TITRE,
          }),
          React.createElement(Text, {
            style: { fontSize: 10, fontFamily: fontFamily, color: texte, lineHeight: 1.45 },
            children: EXEMPLE_LOREM,
          })
        )
      );

    return React.createElement(
      Page,
      {
        key: `typo-${fontKey}`,
        size: 'A4',
        style: mergeStyles(styles.page, { backgroundColor: fond }),
      },
      wrapPageContent(
        React.createElement(
          View,
          { style: styles.section },
          createSectionHeader(5, 'Typographie'),
          React.createElement(Text, {
            style: mergeStyles(styles.sectionIntro),
            children: typeLabel,
          }),
          React.createElement(Text, {
            style: { fontSize: 22, fontFamily: variants.bold, color: texte, marginBottom: SP.lg },
            children: fontName,
          }),
          createVariantBlock('bold', variants.bold, 'Bold'),
          createVariantBlock('regular', variants.regular, 'Regular'),
          createVariantBlock('thin', variants.thin, 'Thin'),
        ),
        pageNum,
        totalPagesCount,
        qwebtyLogoSrc
      )
    );
  };

  pages.push(createFontPage(fontPrincipale, 'principale', 6));
  pages.push(createFontPage(fontSecondaire, 'secondaire', 7));
  pages.push(createFontPage(fontTertiaire, 'tertiaire', 8));

  const createUiBlock = (title, content) =>
    React.createElement(
      View,
      { key: title, style: styles.uiBlock },
      React.createElement(Text, { style: mergeStyles(styles.uiBlockTitle, { fontFamily: getFontVariants(fontTertiaire).bold }), children: title }),
      content
    );

  const createButton = (label, options = {}) => {
    const { bgColor, textColor = '#ffffff', border, borderColor, fontFamily } = options;
    const isOutline = border || borderColor;
    const outlineColor = borderColor || primaire;
    const outlineTextColor = borderColor === BORDER ? texte : outlineColor;
    const btnFont = fontFamily || getFontVariants(fontTertiaire).regular;
    return React.createElement(
      View,
      {
        style: mergeStyles(styles.uiButton, {
          backgroundColor: isOutline ? 'transparent' : (bgColor || primaire),
          ...(isOutline && { borderWidth: 1, borderColor: outlineColor }),
        }),
      },
      React.createElement(Text, {
        style: { color: isOutline ? outlineTextColor : textColor, fontSize: 12, fontFamily: btnFont },
        children: label,
      })
    );
  };

  const pageUiKit = React.createElement(
    Page,
    {
      key: 'uikit',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(6, 'Kit UI', { marginBottom: SP.sm }),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro, { marginTop: 0, marginBottom: SP.sm }),
        children: 'Composants d\'interface utilisant la charte graphique',
      }),
      createUiBlock(
        'Boutons',
        React.createElement(
          View,
          { style: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.sm } },
          createButton('Primaire', { bgColor: primaire }),
          createButton('Secondaire', { bgColor: secondaire }),
          createButton('Contour', { borderColor: BORDER }),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiButton, {
                backgroundColor: '#e2e8f0',
                borderWidth: 1,
                borderColor: BORDER,
                opacity: 0.6,
              }),
            },
            React.createElement(Text, {
              style: { color: secondaire, fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular },
              children: 'Désactivé',
            })
          )
        )
      ),
      createUiBlock(
        'Liens',
        React.createElement(
          View,
          { style: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.lg } },
          React.createElement(Text, {
            style: mergeStyles(styles.uiLink, { color: primaire, fontFamily: getFontVariants(fontTertiaire).regular }),
            children: 'Lien principal',
          }),
          React.createElement(Text, {
            style: mergeStyles(styles.uiLink, { color: secondaire, fontFamily: getFontVariants(fontTertiaire).regular }),
            children: 'Lien secondaire',
          })
        )
      ),
      createUiBlock(
        'Champ de saisie',
        React.createElement(
          View,
          {
            style: mergeStyles(styles.uiInput, {
              borderColor: BORDER,
              backgroundColor: fond,
            }),
          },
          React.createElement(Text, {
            style: { color: secondaire, fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular },
            children: 'Exemple de saisie…',
          })
        )
      ),
      createUiBlock(
        'Glisser-déposer / Parcourir',
        React.createElement(
          View,
          {
            style: mergeStyles(styles.uiDropZone, {
              borderColor: BORDER,
              backgroundColor: fond,
            }),
          },
          React.createElement(Text, {
            style: { color: MUTED, fontSize: 11, fontFamily: getFontVariants(fontTertiaire).regular, textAlign: 'center' },
            children: 'Glissez-déposez vos fichiers ici ou cliquez pour parcourir',
          })
        )
      ),
      createUiBlock(
        'Sélecteur de quantité (number)',
        React.createElement(
          View,
          { style: { flexDirection: 'row', gap: SP.lg, flexWrap: 'wrap', alignItems: 'center' } },
          React.createElement(
            View,
            { style: mergeStyles(styles.uiNumberStepper, { borderColor: BORDER }) },
            React.createElement(
              View,
              { style: styles.uiNumberBtn },
              React.createElement(Text, { style: { fontSize: 16, fontFamily: getFontVariants(fontTertiaire).regular, color: texte }, children: '−' })
            ),
            React.createElement(
              View,
              { style: styles.uiNumberValue },
              React.createElement(Text, { style: { fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular, color: texte }, children: '1' })
            ),
            React.createElement(
              View,
              { style: [styles.uiNumberBtn, styles.uiNumberBtnLast] },
              React.createElement(Text, { style: { fontSize: 16, fontFamily: getFontVariants(fontTertiaire).regular, color: texte }, children: '+' })
            )
          ),
          React.createElement(
            View,
            { style: mergeStyles(styles.uiNumberStepper, { borderColor: BORDER }) },
            React.createElement(
              View,
              { style: styles.uiNumberBtn },
              React.createElement(Text, { style: { fontSize: 16, fontFamily: getFontVariants(fontTertiaire).regular, color: texte }, children: '−' })
            ),
            React.createElement(
              View,
              { style: styles.uiNumberValue },
              React.createElement(Text, { style: { fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular, color: texte }, children: '5' })
            ),
            React.createElement(
              View,
              { style: [styles.uiNumberBtn, styles.uiNumberBtnLast] },
              React.createElement(Text, { style: { fontSize: 16, fontFamily: getFontVariants(fontTertiaire).regular, color: texte }, children: '+' })
            )
          )
        )
      ),
      createUiBlock(
        'Alertes',
        React.createElement(
          View,
          null,
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: hexToRgba(primaire, 0.12),
                borderLeftWidth: 4,
                borderLeftColor: primaire,
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: getFontVariants(fontTertiaire).regular, color: texte },
              children: 'Principale — Message utilisant la couleur principale de la charte.',
            })
          ),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: hexToRgba(secondaire, 0.12),
                borderLeftWidth: 4,
                borderLeftColor: secondaire,
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: getFontVariants(fontTertiaire).regular, color: texte },
              children: 'Secondaire — Message utilisant la couleur secondaire.',
            })
          ),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: fond,
                borderLeftWidth: 4,
                borderLeftColor: lightenHex(texte, 0.6),
                borderWidth: 1,
                borderColor: lightenHex(texte, 0.85),
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: getFontVariants(fontTertiaire).regular, color: texte },
              children: 'Clair — Alerte sur fond clair avec bordure discrète.',
            })
          ),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: texte,
                borderLeftWidth: 4,
                borderLeftColor: texte,
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: getFontVariants(fontTertiaire).regular, color: fond },
              children: 'Sombre — Message sur fond sombre, texte clair.',
            })
          )
        )
      ),
      createUiBlock(
        'Étiquettes (badges)',
        React.createElement(
          View,
          { style: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.sm } },
          React.createElement(
            View,
            { style: mergeStyles(styles.uiBadge, { backgroundColor: primaire }) },
            React.createElement(Text, { style: { color: '#ffffff', fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }, children: 'Primaire' })
          ),
          React.createElement(
            View,
            { style: mergeStyles(styles.uiBadge, { backgroundColor: secondaire }) },
            React.createElement(Text, { style: { color: '#ffffff', fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }, children: 'Secondaire' })
          ),
          React.createElement(
            View,
            { style: mergeStyles(styles.uiBadge, { backgroundColor: 'transparent', borderWidth: 1, borderColor: BORDER }) },
            React.createElement(Text, { style: { color: texte, fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }, children: 'Contour' })
          )
        )
      )
    ),
    9,
    totalPagesCount,
    qwebtyLogoSrc
  )
  );
  pages.push(pageUiKit);

  const pageUiKit2 = React.createElement(
    Page,
    {
      key: 'uikit2',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(6, 'Kit UI (suite)'),
      createUiBlock(
        'Barres de progression',
        React.createElement(
          View,
          { style: { gap: SP.md } },
          React.createElement(View, null,
            React.createElement(Text, { style: mergeStyles(styles.colorLabel, { marginBottom: 4, fontFamily: getFontVariants(fontTertiaire).regular }), children: '25%' }),
            React.createElement(View, { style: styles.uiProgress },
              React.createElement(View, { style: mergeStyles(styles.uiProgressBar, { backgroundColor: primaire, width: '25%' }) })
            )
          ),
          React.createElement(View, null,
            React.createElement(Text, { style: mergeStyles(styles.colorLabel, { marginBottom: 4, fontFamily: getFontVariants(fontTertiaire).regular }), children: '60%' }),
            React.createElement(View, { style: styles.uiProgress },
              React.createElement(View, { style: mergeStyles(styles.uiProgressBar, { backgroundColor: primaire, width: '60%' }) })
            )
          ),
          React.createElement(View, null,
            React.createElement(Text, { style: mergeStyles(styles.colorLabel, { marginBottom: 4, fontFamily: getFontVariants(fontTertiaire).regular }), children: '100%' }),
            React.createElement(View, { style: styles.uiProgress },
              React.createElement(View, { style: mergeStyles(styles.uiProgressBar, { backgroundColor: primaire, width: '100%' }) })
            )
          )
        )
      ),
      createUiBlock(
        'Loader',
        React.createElement(
          View,
          { style: { flexDirection: 'row', alignItems: 'center', gap: SP.lg } },
          React.createElement(View, {
            style: mergeStyles(styles.uiLoaderCircle, {
              borderTopColor: primaire,
              borderRightColor: primaire,
              borderBottomColor: primaire,
              borderLeftColor: fond,
            }),
          }),
          React.createElement(Text, {
            style: mergeStyles(styles.colorLabel, { fontSize: 11, fontFamily: getFontVariants(fontTertiaire).regular }),
            children: 'Chargement…',
          })
        )
      ),
      createUiBlock(
        'Tableau',
        React.createElement(
          View,
          { style: styles.uiTable },
          React.createElement(View, { style: mergeStyles(styles.uiTableRow, styles.uiTableHeader) },
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontFamily: 'Helvetica-Bold', fontSize: 10 }), children: 'Colonne 1' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontFamily: 'Helvetica-Bold', fontSize: 10 }), children: 'Colonne 2' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontFamily: 'Helvetica-Bold', fontSize: 10 }), children: 'Colonne 3' })
          ),
          React.createElement(View, { style: styles.uiTableRow },
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }), children: 'Donnée A' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }), children: 'Donnée B' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }), children: 'Donnée C' })
          ),
          React.createElement(View, { style: styles.uiTableRow },
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }), children: 'Donnée D' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }), children: 'Donnée E' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: getFontVariants(fontTertiaire).regular }), children: 'Donnée F' })
          )
        )
      ),
      createUiBlock(
        'Liste à puces',
        React.createElement(
          View,
          null,
          React.createElement(View, { style: styles.uiListItem },
            React.createElement(Text, { style: { color: primaire, marginRight: SP.sm, fontSize: 12, paddingTop: 2 }, children: '•' }),
            React.createElement(Text, { style: { fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular, color: texte, lineHeight: 14 }, children: 'Premier élément de la liste' })
          ),
          React.createElement(View, { style: styles.uiListItem },
            React.createElement(Text, { style: { color: primaire, marginRight: SP.sm, fontSize: 12, paddingTop: 2 }, children: '•' }),
            React.createElement(Text, { style: { fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular, color: texte, lineHeight: 14 }, children: 'Deuxième élément de la liste' })
          ),
          React.createElement(View, { style: styles.uiListItem },
            React.createElement(Text, { style: { color: primaire, marginRight: SP.sm, fontSize: 12, paddingTop: 2 }, children: '•' }),
            React.createElement(Text, { style: { fontSize: 12, fontFamily: getFontVariants(fontTertiaire).regular, color: texte, lineHeight: 14 }, children: 'Troisième élément de la liste' })
          )
        )
      ),
      createUiBlock(
        'Carte',
        React.createElement(
          View,
          {
            style: mergeStyles(styles.uiCard, {
              borderColor: BORDER,
              backgroundColor: fond,
            }),
          },
          React.createElement(Text, {
            style: { fontSize: TYPO_SIZES.sousTitre, fontFamily: getFontVariants(fontPrincipale).bold, color: texte, marginBottom: 6 },
            children: 'Titre de la carte',
          }),
          React.createElement(Text, {
            style: { fontSize: TYPO_SIZES.corps, fontFamily: fontSecondaire, color: secondaire, marginBottom: 8, lineHeight: 1.5 },
            children: 'Sous-titre ou description courte. Ce composant peut contenir du texte et des actions.',
          }),
          React.createElement(
            View,
            { style: { flexDirection: 'row', justifyContent: 'flex-end', gap: SP.sm, flexWrap: 'wrap' } },
            createButton('Action', { bgColor: primaire, fontFamily: getFontVariants(fontSecondaire).regular }),
            createButton('Action', { bgColor: secondaire, fontFamily: getFontVariants(fontSecondaire).regular }),
            createButton('Action', { borderColor: secondaire, fontFamily: getFontVariants(fontSecondaire).regular })
          )
        )
      )
    ),
    10,
    totalPagesCount,
    qwebtyLogoSrc
  )
  );
  pages.push(pageUiKit2);

  if (otherImages.length > 0) {
    const pageImages = React.createElement(
      Page,
      {
        key: 'images',
        size: 'A4',
        style: mergeStyles(styles.page, { backgroundColor: fond }),
      },
      wrapPageContent(
        React.createElement(
          View,
          { style: styles.section },
          createSectionHeader(7, 'Éléments graphiques'),
          React.createElement(Text, {
            style: mergeStyles(styles.sectionIntro),
            children: 'Fichiers du dossier entrée',
          }),
          React.createElement(
            View,
            { style: styles.imageGrid },
            ...otherImages.map((img, i) =>
              React.createElement(
                View,
                { key: i, style: styles.imageItem },
                React.createElement(Image, { src: img.src, style: styles.img }),
                React.createElement(Text, {
                  style: styles.colorLabel,
                  children: img.name,
                })
              )
            )
          )
        ),
        11,
        totalPagesCount,
        qwebtyLogoSrc
      )
    );
    pages.push(pageImages);
  }

  const aboutQwebtyPageNum = otherImages.length > 0 ? 12 : 11;
  const aboutLogoContent = qwebtyLogoSrc
    ? React.createElement(
        View,
        { style: { alignItems: 'flex-start' } },
        React.createElement(Image, { src: qwebtyLogoSrc, style: mergeStyles(styles.qwebtyLogoImg, { height: 40 }) })
      )
    : React.createElement(
        View,
        { style: { alignItems: 'flex-start' } },
        React.createElement(Text, {
          style: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: MUTED, letterSpacing: 1 },
          children: QWEBTY.name,
        })
      );

  const aboutContent = React.createElement(
    View,
    { style: styles.aboutPage },
    React.createElement(View, { style: styles.aboutHeader }, aboutLogoContent),
    React.createElement(
      View,
      { style: styles.aboutMain },
      React.createElement(Text, {
        style: styles.aboutTitle,
        children: 'À propos de Qwebty',
      }),
      React.createElement(Text, {
        style: styles.aboutText,
        children: 'Qwebty est une agence web et digitale basée à Lyon. Nous créons des solutions web sur mesure : sites performants, applications SaaS, intégration IA, SEO et conformité RGPD. Ce document a été généré par notre outil de charte graphique.',
      })
    )
  );

  const pageAboutQwebty = React.createElement(
    Page,
    {
      key: 'about-qwebty',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    wrapPageContent(aboutContent, aboutQwebtyPageNum, totalPagesCount, qwebtyLogoSrc)
  );
  pages.push(pageAboutQwebty);

  const CharteDocument = () =>
    React.createElement(Document, null, ...pages);

  await renderToFile(React.createElement(CharteDocument), outputPath);
}
