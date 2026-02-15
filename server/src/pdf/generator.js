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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    marginBottom: 16,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
    borderBottomWidth: 2,
    paddingBottom: 4,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  colorBox: {
    width: 80,
    height: 40,
    borderRadius: 4,
    marginBottom: 4,
  },
  colorLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
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
});

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

export async function generatePdf(config, imagePaths, outputPath) {
  const colors = config.couleurs || {};
  const projet = config.projet || {};
  const typo = config.typographie || {};

  const colorEntries = Object.entries(colors);

  const images = [];
  for (const p of imagePaths) {
    try {
      const src = await imageToBase64(p);
      images.push({ src, name: path.basename(p) });
    } catch (e) {
      console.warn('Skip image:', p, e.message);
    }
  }

  const primaire = colors.primaire || '#2563eb';
  const secondaire = colors.secondaire || '#64748b';
  const fond = colors.fond || '#ffffff';
  const texte = colors.texte || '#1e293b';

  const coverChildren = [
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
  ];
  if (projet.date) {
    coverChildren.push(
      React.createElement(Text, {
        key: 'date',
        style: mergeStyles(styles.subtitle, { marginTop: 8 }),
        children: projet.date,
      })
    );
  }

  const page2Children = [
    React.createElement(
      View,
      { key: 'colors', style: styles.section },
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
        }),
        children: 'Palette de couleurs',
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
                borderColor: '#e2e8f0',
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
    ),
    React.createElement(
      View,
      { key: 'typo', style: styles.section },
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
        }),
        children: 'Typographie',
      }),
      React.createElement(Text, {
        style: { fontSize: typo.tailleCorps || 12, color: texte },
        children: `Titre : ${typo.titre || 'Helvetica-Bold'} (${typo.tailleTitre || 24}pt)`,
      }),
      React.createElement(Text, {
        style: { fontSize: typo.tailleCorps || 12, marginTop: 4, color: texte },
        children: `Corps : ${typo.corps || 'Helvetica'} (${typo.tailleCorps || 12}pt)`,
      })
    ),
  ];

  if (images.length > 0) {
    page2Children.push(
      React.createElement(
        View,
        { key: 'images', style: styles.section },
        React.createElement(Text, {
          style: mergeStyles(styles.sectionTitle, {
            color: primaire,
            borderBottomColor: primaire,
          }),
          children: 'Éléments graphiques (dossier input)',
        }),
        React.createElement(
          View,
          { style: styles.imageGrid },
          ...images.map((img, i) =>
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
  }

  const CharteDocument = () =>
    React.createElement(
      Document,
      null,
      React.createElement(
        Page,
        { size: 'A4', style: mergeStyles(styles.page, { backgroundColor: fond }) },
        React.createElement(View, { style: styles.cover }, ...coverChildren)
      ),
      React.createElement(
        Page,
        { size: 'A4', style: mergeStyles(styles.page, { backgroundColor: fond }) },
        ...page2Children
      )
    );

  await renderToFile(React.createElement(CharteDocument), outputPath);
}
