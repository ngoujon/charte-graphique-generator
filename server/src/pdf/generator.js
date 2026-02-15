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
  logoBox: {
    width: 160,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  logoImg: {
    maxWidth: 140,
    maxHeight: 90,
    objectFit: 'contain',
  },
  typoExample: {
    marginBottom: 16,
  },
  numbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  numberBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
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
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  articleBlock: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
});

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

function findLogos(images) {
  const clair = images.find((i) =>
    /clair|light|claire/i.test(i.name)
  );
  const sombre = images.find((i) =>
    /sombre|dark|noir/i.test(i.name)
  );
  const first = images[0];
  const second = images[1];
  return {
    clair: clair || first,
    sombre: sombre || second || first,
  };
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

  const { clair: logoClair, sombre: logoSombre } = findLogos(images);
  const otherImages = images.filter(
    (i) => i !== logoClair && i !== logoSombre
  );

  const primaire = colors.primaire || '#2563eb';
  const secondaire = colors.secondaire || '#64748b';
  const fond = colors.fond || '#ffffff';
  const texte = colors.texte || '#1e293b';

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

  const sommaireItems = ['Logo', 'Palette de couleurs', 'Typographie (titre, sous-titre, description)', 'Chiffres 0-9'];
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
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
        }),
        children: 'Sommaire — Aperçu de la charte',
      }),
      ...sommaireItems.map((item, i) =>
        React.createElement(
          View,
          {
            key: i,
            style: {
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 12,
            },
          },
          React.createElement(View, {
            style: {
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: primaire,
              marginRight: 12,
            },
          }),
          React.createElement(Text, {
            style: { fontSize: 14, color: texte, fontFamily: fontCorps },
            children: item,
          })
        )
      )
    )
  );
  pages.push(pageSommaire);

  const logoSectionChildren = [];

  const logoClairContent = logoClair
    ? React.createElement(Image, {
        src: logoClair.src,
        style: styles.logoImg,
      })
    : createPlaceholderLogo(fond || '#ffffff', texte || '#1e293b');

  const logoSombreContent = logoSombre
    ? React.createElement(Image, {
        src: logoSombre.src,
        style: styles.logoImg,
      })
    : createPlaceholderLogo(texte || '#1e293b', fond || '#ffffff');

  logoSectionChildren.push(
    React.createElement(
      View,
      { key: 'clair-wrap', style: { marginBottom: 20 } },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, {
          marginBottom: 8,
          fontSize: 11,
          fontFamily: 'Helvetica-Bold',
        }),
        children: logoClair ? 'Logo clair (fond clair)' : 'Logo clair — Exemple (remplacez par votre fichier)',
      }),
      React.createElement(
        View,
        {
          style: mergeStyles(styles.logoBox, {
            backgroundColor: fond || '#ffffff',
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }),
        },
        logoClairContent
      )
    )
  );

  logoSectionChildren.push(
    React.createElement(
      View,
      { key: 'sombre-wrap' },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, {
          marginBottom: 8,
          fontSize: 11,
          fontFamily: 'Helvetica-Bold',
        }),
        children: logoSombre ? 'Logo sombre (fond sombre)' : 'Logo sombre — Exemple (remplacez par votre fichier)',
      }),
      React.createElement(
        View,
        {
          style: mergeStyles(styles.logoBox, {
            backgroundColor: texte || '#1e293b',
          }),
        },
        logoSombreContent
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
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
        }),
        children: 'Logo — Déclinaisons',
      }),
      React.createElement(
        View,
        { style: { flexDirection: 'row', flexWrap: 'wrap', gap: 32 } },
        ...logoSectionChildren
      )
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
    )
  );
  pages.push(pageCouleurs);

  const ALPHABET_MAJ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const ALPHABET_MIN = 'abcdefghijklmnopqrstuvwxyz';

  const typoSectionChildren = [
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
        { style: mergeStyles(styles.articleBlock, { borderColor: '#e2e8f0' }) },
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
      React.createElement(
        View,
        { key: 'alphabet-titre', style: { marginBottom: 16 } },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, { marginBottom: 4, fontSize: 10 }),
        children: `Titre — ${fontTitre} (${tailleTitre}pt)`,
      }),
      React.createElement(Text, {
        style: {
          fontSize: Math.min(tailleTitre, 14),
          fontFamily: fontTitre,
          color: texte,
        },
        children: ALPHABET_MAJ,
      }),
      React.createElement(Text, {
        style: {
          fontSize: Math.min(tailleTitre, 14),
          fontFamily: fontTitre,
          color: texte,
          marginTop: 2,
        },
        children: ALPHABET_MIN,
      })
    ),
      React.createElement(
        View,
        { key: 'alphabet-soustitre', style: { marginBottom: 16 } },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, { marginBottom: 4, fontSize: 10 }),
        children: `Sous-titre — ${fontCorps} (${tailleSousTitre}pt)`,
      }),
      React.createElement(Text, {
        style: {
          fontSize: Math.min(tailleSousTitre, 12),
          fontFamily: fontCorps,
          color: texte,
        },
        children: ALPHABET_MAJ,
      }),
      React.createElement(Text, {
        style: {
          fontSize: Math.min(tailleSousTitre, 12),
          fontFamily: fontCorps,
          color: texte,
          marginTop: 2,
        },
        children: ALPHABET_MIN,
      })
    ),
      React.createElement(
        View,
        { key: 'alphabet-desc', style: { marginBottom: 8 } },
      React.createElement(Text, {
        style: mergeStyles(styles.colorLabel, { marginBottom: 4, fontSize: 10 }),
        children: `Description — ${fontCorps} (${tailleCorps}pt)`,
      }),
      React.createElement(Text, {
        style: {
          fontSize: Math.min(tailleCorps, 11),
          fontFamily: fontCorps,
          color: texte,
        },
        children: ALPHABET_MAJ,
      }),
      React.createElement(Text, {
        style: {
          fontSize: Math.min(tailleCorps, 11),
          fontFamily: fontCorps,
          color: texte,
          marginTop: 2,
        },
        children: ALPHABET_MIN,
      })
    )
    ),
  ];

  const numbersSection = React.createElement(
    View,
    { key: 'numbers', style: styles.section },
    React.createElement(Text, {
      style: mergeStyles(styles.sectionTitle, {
        color: primaire,
        borderBottomColor: primaire,
      }),
      children: 'Chiffres 0-9',
    }),
    React.createElement(
      View,
      { style: styles.numbersRow },
      ...'0123456789'.split('').map((n) =>
        React.createElement(
          View,
          { key: n, style: styles.numberBox },
          React.createElement(Text, {
            style: {
              fontSize: 18,
              fontFamily: fontCorps,
              color: texte,
            },
            children: n,
          })
        )
      )
    )
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
      React.createElement(Text, {
        style: mergeStyles(styles.sectionTitle, {
          color: primaire,
          borderBottomColor: primaire,
        }),
        children: 'Typographie',
      }),
      ...typoSectionChildren
    ),
    numbersSection
  );
  pages.push(pageTypo);

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
