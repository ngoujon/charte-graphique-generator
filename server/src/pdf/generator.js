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
  renderToFile,
} from '@react-pdf/renderer';
import fs from 'fs/promises';
import path from 'path';

const SP = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const BORDER = '#cbd5e1';
const MUTED = '#64748b';

const styles = StyleSheet.create({
  page: {
    padding: SP.xl,
    fontFamily: 'Helvetica',
  },
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverAccent: {
    width: 60,
    height: 4,
    marginBottom: SP.lg,
    borderRadius: 2,
  },
  title: {
    fontSize: 36,
    marginBottom: SP.sm,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: MUTED,
    maxWidth: 400,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  coverBadge: {
    marginTop: SP.xl,
    paddingVertical: SP.sm,
    paddingHorizontal: SP.md,
    borderRadius: 20,
    borderWidth: 1,
  },
  section: {
    marginBottom: SP.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SP.lg,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
    lineHeight: 1.4,
    paddingBottom: SP.md,
    marginBottom: 0,
    borderBottomWidth: 2,
  },
  sectionIntro: {
    fontSize: 11,
    color: MUTED,
    marginTop: SP.sm,
    marginBottom: SP.lg,
    lineHeight: 1.5,
  },
  marqueCard: {
    padding: SP.lg,
    marginBottom: SP.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fafbfc',
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
    backgroundColor: '#fafbfc',
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
    marginBottom: SP.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fafbfc',
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
    paddingLeft: SP.xl + 4,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: '#fafbfc',
    borderLeftWidth: 4,
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
    marginBottom: SP.lg,
  },
  uiBlockTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: MUTED,
    marginBottom: SP.sm,
  },
  uiAlert: {
    padding: SP.md,
    borderRadius: 8,
    marginBottom: SP.sm,
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
    backgroundColor: '#f1f5f9',
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
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: SP.sm,
  },
  uiProgressBar: {
    height: '100%',
    borderRadius: 4,
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
});

function createSectionHeader(num, title, primaire) {
  return React.createElement(
    View,
    { style: styles.sectionHeader },
    React.createElement(
      View,
      { style: mergeStyles(styles.sectionNumber, { backgroundColor: primaire }) },
      React.createElement(Text, { style: { color: '#fff', fontSize: 12, fontFamily: 'Helvetica-Bold' }, children: String(num) })
    ),
    React.createElement(Text, {
      style: mergeStyles(styles.sectionTitle, { color: primaire, borderBottomColor: primaire }),
      children: title,
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

export async function generatePdf(config, imagePaths, outputPath) {
  const colors = config.couleurs || {};
  const projet = config.projet || {};
  const typo = config.typographie || {};

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
  const fond = colors.clair || colors.fond || colors.blanc || '#f5f5dc';
  const texte = colors.sombre || colors.texte || colors.noir || '#1a1a1a';
  const accent = colors.accent || '#f59e0b';

  const colorEntries = [
    ['clair', fond],
    ['sombre', texte],
    ['primaire', primaire],
    ['secondaire', secondaire],
    ['accent', accent],
  ];
  const exempleTitre = typo.exempleTitre || "Titre de l'exemple";
  const exempleSousTitre = typo.exempleSousTitre || 'Sous-titre de l\'exemple';
  const exempleDescription =
    typo.exempleDescription ||
    'Description ou corps de texte. Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  const tailleTitre = typo.tailleTitre || 24;
  const tailleSousTitre = typo.tailleSousTitre || 18;
  const tailleCorps = typo.tailleCorps || 12;
  const fontTitre = typo.titre || 'Helvetica-Bold';
  const fontCorps = typo.corps || 'Helvetica';

  const coverChildren = [
    React.createElement(View, {
      key: 'accent',
      style: mergeStyles(styles.coverAccent, { backgroundColor: primaire }),
    }),
    React.createElement(Text, {
      key: 'title',
      style: mergeStyles(styles.title, {
        color: colors.primaire || colors.texte || texte,
      }),
      children: projet.nom || 'Charte Graphique',
    }),
    React.createElement(Text, {
      key: 'desc',
      style: mergeStyles(styles.subtitle, { color: secondaire }),
      children: projet.description || 'Document de charge graphique',
    }),
    React.createElement(
      View,
      {
        key: 'badge',
        style: mergeStyles(styles.coverBadge, {
          borderColor: primaire,
        }),
      },
      React.createElement(Text, {
        style: { fontSize: 11, color: primaire, fontFamily: 'Helvetica-Bold' },
        children: projet.date ? `Document · ${projet.date}` : 'Charte graphique',
      })
    ),
  ];

  const pages = [];

  pages.push(
    React.createElement(
      Page,
      {
        key: 'cover',
        size: 'A4',
        style: mergeStyles(styles.page, { backgroundColor: fond }),
      },
      React.createElement(View, { style: styles.cover }, ...coverChildren)
    )
  );

  const sommaireItems = ['Présentation de la marque', 'Logo', 'Palette de couleurs', 'Typographie (titre, sous-titre, description)', 'Chiffres 0-9', 'Kit UI'];
  if (otherImages.length > 0) sommaireItems.push('Éléments graphiques');

  const pageSommaire = React.createElement(
    Page,
    {
      key: 'sommaire',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(1, 'Sommaire', primaire),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro),
        children: 'Ce document applique les 13 principes du design graphique : alignement, contraste, équilibre, hiérarchie, couleur, espace blanc, proportion, répétition, rythme, mouvement, mise en valeur, proximité et unité.',
      }),
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
              borderBottomColor: '#f1f5f9',
            },
          },
          React.createElement(Text, {
            style: { fontSize: 11, color: primaire, fontFamily: 'Helvetica-Bold', width: 24 },
            children: `${String(i + 2).padStart(2, '0')}`,
          }),
          React.createElement(Text, {
            style: { fontSize: 14, color: texte, fontFamily: fontCorps, flex: 1 },
            children: item,
          })
        )
      )
    )
  );
  pages.push(pageSommaire);

  const marque = config.marque || {};
  const marqueFields = [
    {
      key: 'nom',
      label: 'Nom de la marque',
      value: projet.nom || 'Mon Projet',
      style: { fontSize: tailleTitre, fontFamily: fontTitre, color: primaire },
    },
    {
      key: 'slogan',
      label: 'Slogan',
      value: marque.slogan || '',
      style: { fontSize: tailleSousTitre, fontFamily: fontCorps, color: secondaire, fontStyle: 'italic', lineHeight: 1.5 },
    },
    {
      key: 'mission',
      label: 'Mission',
      value: marque.mission || '',
      style: { fontSize: tailleCorps, fontFamily: fontCorps, color: texte, lineHeight: 1.6 },
    },
    {
      key: 'valeurs',
      label: 'Valeurs',
      value: marque.valeurs || '',
      style: { fontSize: tailleCorps, fontFamily: fontCorps, color: texte, lineHeight: 1.6 },
    },
    {
      key: 'personnalite',
      label: 'Personnalité',
      value: marque.personnalite || '',
      style: { fontSize: tailleCorps, fontFamily: fontCorps, color: texte, lineHeight: 1.6 },
    },
  ];

  const marqueCards = marqueFields.map(({ key, label, value, style }) =>
    React.createElement(
      View,
      { key: `marque-${key}`, style: styles.marqueCard },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, { marginBottom: SP.sm, fontSize: 10, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase' }),
        children: label,
      }),
      React.createElement(Text, {
        style: style,
        children: value || '—',
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
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(2, 'Présentation de la marque', primaire),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro),
        children: 'Identité et positionnement de la marque',
      }),
      ...marqueCards
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
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(3, 'Logo — Déclinaisons', primaire),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro),
        children: 'Versions claire, sombre, sur couleur principale et sur couleur secondaire',
      }),
      React.createElement(View, { style: styles.logoGrid }, ...logoGridItems)
    )
  );

  pages.push(pageLogo);

  const pageCouleurs = React.createElement(
    Page,
    {
      key: 'couleurs',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(4, 'Palette de couleurs', primaire),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro),
        children: 'Palette à 5 couleurs : clair, sombre, principale, secondaire, tertiaire',
      }),
      React.createElement(
        View,
        { style: styles.colorRow },
        ...colorEntries.map(([name, hex]) =>
          React.createElement(
            View,
            { key: name, style: styles.imageItem },
            React.createElement(View, {
              style: mergeStyles(styles.colorBox, {
                backgroundColor: hex,
                borderWidth: 1,
                borderColor: BORDER,
              }),
            }),
            React.createElement(Text, {
              style: styles.colorLabel,
              children: name,
            }),
            React.createElement(Text, {
              style: mergeStyles(styles.colorLabel, { fontSize: 9 }),
              children: hex,
            })
          )
        )
      )
    )
  );
  pages.push(pageCouleurs);

  const ALPHABET_MAJ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ALPHABET_MIN = 'abcdefghijklmnopqrstuvwxyz';

  const typoSpecsCard = React.createElement(
    View,
    { key: 'typo-specs', style: styles.typoSpecsCard },
    React.createElement(View, { style: styles.typoSpecItem },
      React.createElement(Text, { style: styles.typoSpecLabel, children: 'Titre' }),
      React.createElement(Text, { style: mergeStyles(styles.typoSpecValue, { color: primaire }), children: `${fontTitre} · ${tailleTitre}pt` })
    ),
    React.createElement(View, { style: styles.typoSpecItem },
      React.createElement(Text, { style: styles.typoSpecLabel, children: 'Sous-titre' }),
      React.createElement(Text, { style: mergeStyles(styles.typoSpecValue, { color: primaire }), children: `${fontCorps} · ${tailleSousTitre}pt` })
    ),
    React.createElement(View, { style: styles.typoSpecItem },
      React.createElement(Text, { style: styles.typoSpecLabel, children: 'Corps' }),
      React.createElement(Text, { style: mergeStyles(styles.typoSpecValue, { color: primaire }), children: `${fontCorps} · ${tailleCorps}pt` })
    )
  );

  const createTypoLevelCard = (label, font, size, color) =>
    React.createElement(
      View,
      { key: label, style: styles.typoLevelCard },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, { marginBottom: SP.sm, fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }),
        children: `${label} — ${font} (${size}pt)`,
      }),
      React.createElement(Text, {
        style: { fontSize: Math.min(size, 14), fontFamily: font, color, lineHeight: 1.4 },
        children: ALPHABET_MAJ,
      }),
      React.createElement(Text, {
        style: { fontSize: Math.min(size, 14), fontFamily: font, color, marginTop: 4, lineHeight: 1.4 },
        children: ALPHABET_MIN,
      })
    );

  const typoSectionChildren = [
    typoSpecsCard,
    React.createElement(
      View,
      { key: 'article', style: styles.section },
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
          marginBottom: 12,
        }),
        children: 'Exemple d\'article',
      }),
      React.createElement(
        View,
        { style: mergeStyles(styles.articleBlock, { borderColor: BORDER, borderLeftColor: primaire }) },
        React.createElement(Text, {
          style: {
            fontSize: tailleTitre,
            fontFamily: fontTitre,
            color: texte,
            marginBottom: 8,
          },
          children: exempleTitre,
        }),
        React.createElement(Text, {
          style: {
            fontSize: tailleSousTitre,
            fontFamily: fontCorps,
            color: secondaire,
            marginBottom: 12,
          },
          children: exempleSousTitre,
        }),
        React.createElement(Text, {
          style: {
            fontSize: tailleCorps,
            fontFamily: fontCorps,
            color: texte,
            lineHeight: 1.6,
          },
          children: exempleDescription,
        })
      )
    ),
    React.createElement(
      View,
      { key: 'alphabets', style: styles.section },
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
          marginBottom: 12,
        }),
        children: 'Alphabet',
      }),
      createTypoLevelCard('Titre', fontTitre, tailleTitre, texte),
      createTypoLevelCard('Sous-titre', fontCorps, tailleSousTitre, texte),
      createTypoLevelCard('Corps', fontCorps, tailleCorps, texte),
    ),
  ];

  const createNumbersRow = (font, size, prefix) =>
    React.createElement(
      View,
      { key: prefix, style: mergeStyles(styles.typoLevelCard, { marginBottom: SP.md }) },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, { marginBottom: SP.sm, fontSize: 9, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 }),
        children: `${prefix} — ${font} (${size}pt)`,
      }),
      React.createElement(
        View,
        { style: styles.numbersRow },
        ...'0123456789'.split('').map((n) =>
          React.createElement(
            View,
            { key: `${prefix}-${n}`, style: styles.numberBox },
            React.createElement(Text, {
              style: {
                fontSize: Math.min(size, 18),
                fontFamily: font,
                color: texte,
              },
              children: n,
            })
          )
        )
      )
    );

  const numbersSection = React.createElement(
    View,
    { key: 'numbers', style: styles.section },
    React.createElement(Text, {
      style: mergeStyles(styles.sectionTitle, {
        color: primaire,
        borderBottomColor: primaire,
        marginBottom: 12,
      }),
      children: 'Chiffres 0-9',
    }),
    createNumbersRow(fontTitre, tailleTitre, 'Titre'),
    createNumbersRow(fontCorps, tailleSousTitre, 'Sous-titre'),
    createNumbersRow(fontCorps, tailleCorps, 'Corps'),
  );

  const pageTypo = React.createElement(
    Page,
    {
      key: 'typo',
      size: 'A4',
      style: mergeStyles(styles.page, { backgroundColor: fond }),
    },
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(5, 'Typographie', primaire),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro),
        children: 'Hiérarchie des textes, alphabets et chiffres',
      }),
      ...typoSectionChildren
    ),
    numbersSection
  );
  pages.push(pageTypo);

  const createUiBlock = (title, content) =>
    React.createElement(
      View,
      { key: title, style: styles.uiBlock },
      React.createElement(Text, { style: styles.uiBlockTitle, children: title }),
      content
    );

  const createButton = (label, options = {}) => {
    const { bgColor, textColor = '#ffffff', border } = options;
    return React.createElement(
      View,
      {
        style: mergeStyles(styles.uiButton, {
          backgroundColor: bgColor || primaire,
          ...(border && { borderWidth: 1, borderColor: primaire, backgroundColor: 'transparent' }),
        }),
      },
      React.createElement(Text, {
        style: { color: border ? primaire : textColor, fontSize: 12, fontFamily: fontCorps },
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
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(6, 'Kit UI', primaire),
      React.createElement(Text, {
        style: mergeStyles(styles.sectionIntro),
        children: 'Composants d\'interface utilisant la charte graphique',
      }),
      createUiBlock(
        'Boutons',
        React.createElement(
          View,
          { style: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.sm } },
          createButton('Primaire', { bgColor: primaire }),
          createButton('Secondaire', { border: true }),
          createButton('Accent', { bgColor: accent }),
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
              style: { color: secondaire, fontSize: 12, fontFamily: fontCorps },
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
            style: mergeStyles(styles.uiLink, { color: primaire }),
            children: 'Lien principal',
          }),
          React.createElement(Text, {
            style: mergeStyles(styles.uiLink, { color: secondaire }),
            children: 'Lien secondaire',
          }),
          React.createElement(Text, {
            style: mergeStyles(styles.uiLink, { color: accent }),
            children: 'Lien accent',
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
            style: { color: secondaire, fontSize: 12, fontFamily: fontCorps },
            children: 'Exemple de saisie…',
          })
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderLeftWidth: 4,
                borderLeftColor: '#10b981',
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: fontCorps, color: texte },
              children: 'Succès — Opération réalisée avec succès.',
            })
          ),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderLeftWidth: 4,
                borderLeftColor: '#ef4444',
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: fontCorps, color: texte },
              children: 'Erreur — Une erreur s\'est produite.',
            })
          ),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderLeftWidth: 4,
                borderLeftColor: accent,
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: fontCorps, color: texte },
              children: 'Attention — Vérifiez les informations.',
            })
          ),
          React.createElement(
            View,
            {
              style: mergeStyles(styles.uiAlert, {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderLeftWidth: 4,
                borderLeftColor: primaire,
              }),
            },
            React.createElement(Text, {
              style: { fontSize: 11, fontFamily: fontCorps, color: texte },
              children: 'Info — Information complémentaire.',
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
            React.createElement(Text, { style: { color: '#ffffff', fontSize: 10, fontFamily: fontCorps }, children: 'Primaire' })
          ),
          React.createElement(
            View,
            { style: mergeStyles(styles.uiBadge, { backgroundColor: secondaire }) },
            React.createElement(Text, { style: { color: '#ffffff', fontSize: 10, fontFamily: fontCorps }, children: 'Secondaire' })
          ),
          React.createElement(
            View,
            { style: mergeStyles(styles.uiBadge, { backgroundColor: accent }) },
            React.createElement(Text, { style: { color: '#ffffff', fontSize: 10, fontFamily: fontCorps }, children: 'Accent' })
          ),
          React.createElement(
            View,
            { style: mergeStyles(styles.uiBadge, { backgroundColor: 'transparent', borderWidth: 1, borderColor: BORDER }) },
            React.createElement(Text, { style: { color: texte, fontSize: 10, fontFamily: fontCorps }, children: 'Outline' })
          )
        )
      )
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
    React.createElement(
      View,
      { style: styles.section },
      createSectionHeader(6, 'Kit UI (suite)', primaire),
      createUiBlock(
        'Barres de progression',
        React.createElement(
          View,
          { style: { gap: SP.md } },
          React.createElement(View, null,
            React.createElement(Text, { style: mergeStyles(styles.colorLabel, { marginBottom: 4 }), children: '25%' }),
            React.createElement(View, { style: styles.uiProgress },
              React.createElement(View, { style: mergeStyles(styles.uiProgressBar, { backgroundColor: primaire, width: '25%' }) })
            )
          ),
          React.createElement(View, null,
            React.createElement(Text, { style: mergeStyles(styles.colorLabel, { marginBottom: 4 }), children: '60%' }),
            React.createElement(View, { style: styles.uiProgress },
              React.createElement(View, { style: mergeStyles(styles.uiProgressBar, { backgroundColor: secondaire, width: '60%' }) })
            )
          ),
          React.createElement(View, null,
            React.createElement(Text, { style: mergeStyles(styles.colorLabel, { marginBottom: 4 }), children: '100%' }),
            React.createElement(View, { style: styles.uiProgress },
              React.createElement(View, { style: mergeStyles(styles.uiProgressBar, { backgroundColor: accent, width: '100%' }) })
            )
          )
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
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: fontCorps }), children: 'Donnée A' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: fontCorps }), children: 'Donnée B' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: fontCorps }), children: 'Donnée C' })
          ),
          React.createElement(View, { style: styles.uiTableRow },
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: fontCorps }), children: 'Donnée D' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: fontCorps }), children: 'Donnée E' }),
            React.createElement(Text, { style: mergeStyles(styles.uiTableCell, { fontSize: 10, fontFamily: fontCorps }), children: 'Donnée F' })
          )
        )
      ),
      createUiBlock(
        'Liste à puces',
        React.createElement(
          View,
          null,
          React.createElement(View, { style: styles.uiListItem },
            React.createElement(Text, { style: { color: primaire, marginRight: SP.sm, fontSize: 12 }, children: '•' }),
            React.createElement(Text, { style: { fontSize: 12, fontFamily: fontCorps, color: texte }, children: 'Premier élément de la liste' })
          ),
          React.createElement(View, { style: styles.uiListItem },
            React.createElement(Text, { style: { color: primaire, marginRight: SP.sm, fontSize: 12 }, children: '•' }),
            React.createElement(Text, { style: { fontSize: 12, fontFamily: fontCorps, color: texte }, children: 'Deuxième élément de la liste' })
          ),
          React.createElement(View, { style: styles.uiListItem },
            React.createElement(Text, { style: { color: primaire, marginRight: SP.sm, fontSize: 12 }, children: '•' }),
            React.createElement(Text, { style: { fontSize: 12, fontFamily: fontCorps, color: texte }, children: 'Troisième élément de la liste' })
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
            style: { fontSize: tailleSousTitre, fontFamily: fontTitre, color: texte, marginBottom: 6 },
            children: 'Titre de la carte',
          }),
          React.createElement(Text, {
            style: { fontSize: tailleCorps, fontFamily: fontCorps, color: secondaire, marginBottom: 8, lineHeight: 1.5 },
            children: 'Sous-titre ou description courte. Ce composant peut contenir du texte et des actions.',
          }),
          createButton('Action', { bgColor: primaire })
        )
      )
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
      React.createElement(
        View,
        { style: styles.section },
        createSectionHeader(7, 'Éléments graphiques', primaire),
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
      )
    );
    pages.push(pageImages);
  }

  const CharteDocument = () =>
    React.createElement(Document, null, ...pages);

  await renderToFile(React.createElement(CharteDocument), outputPath);
}
