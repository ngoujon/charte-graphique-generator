import { View } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, Block } from '../layout.js';
import { SP } from '../theme.js';
import { getCatalogFont, CATEGORY_LABELS, STANDARD_FONTS } from '../../../../shared/fonts.js';
import { frTypo } from '../text.js';

const WEIGHT_NAMES = { 300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' };

function fontInfo(id) {
  const cat = getCatalogFont(id);
  if (cat) return { category: CATEGORY_LABELS[cat.category], weights: cat.weights };
  const std = STANDARD_FONTS.find((f) => f.id === id);
  if (std) return { category: CATEGORY_LABELS[std.category], weights: [400, 700] };
  return { category: 'Police personnalisée', weights: [400] };
}

export function typeFamiliesPage(ctx, section) {
  const { t } = ctx;
  const roles = [
    { key: 'title', role: 'Titres', usage: 'Intertitres, accroches, couverture', id: t.ids.title, name: t.names.title, f: t.f.title },
    { key: 'body', role: 'Texte courant', usage: 'Paragraphes, interfaces, légendes', id: t.ids.body, name: t.names.body, f: t.f.body },
    { key: 'accent', role: 'Accent', usage: 'Chiffres, citations, détails techniques', id: t.ids.accent, name: t.names.accent, f: t.f.accent },
  ];

  const rows = roles.map((r, i) => {
    const info = fontInfo(r.id);
    return h(
      View,
      {
        key: r.key,
        style: {
          flexDirection: 'row',
          paddingVertical: SP.xl,
          borderTopWidth: 0.5,
          borderBottomWidth: i === roles.length - 1 ? 0.5 : 0,
          borderColor: t.c.hairline,
        },
      },
      h(
        View,
        { style: { width: 120, alignItems: 'flex-start' } },
        Txt(sx(r.f(400), { fontSize: 64, lineHeight: 1, color: t.c.accentText }), 'Aa')
      ),
      h(
        View,
        { style: { flex: 1 } },
        Txt(sx(t.text.label, { marginBottom: 3 }), `${r.role} · ${r.usage}`),
        Txt(sx(r.f(600), { fontSize: 20, color: t.c.ink, marginBottom: 3 }), r.name),
        Txt(sx(t.text.small, { marginBottom: SP.md }), `${info.category} · ${info.weights.map((w) => WEIGHT_NAMES[w]).join(' · ')}`),
        Txt(sx(r.f(400), { fontSize: 10.5, color: t.c.ink, lineHeight: 1.5 }), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        Txt(sx(r.f(400), { fontSize: 10.5, color: t.c.ink, lineHeight: 1.5 }), 'abcdefghijklmnopqrstuvwxyz àéèêçœ'),
        Txt(sx(r.f(400), { fontSize: 10.5, color: t.c.muted, lineHeight: 1.5 }), '0123456789 « » ! ? & @ € % ( )')
      )
    );
  });

  return ContentPage(
    ctx,
    {
      key: 'type-families',
      section,
      title: 'Typographie',
      intro: 'Trois rôles typographiques donnent du rythme et une voix reconnaissable à tous les supports.',
    },
    ...rows
  );
}

export function typeScalePage(ctx, section) {
  const { t, projet, marque } = ctx;
  const sampleTitle = projet.nom || 'Titre principal';
  const sampleBody =
    marque.mission ||
    'Un texte courant clair et aéré facilite la lecture. Privilégiez des paragraphes courts et une longueur de ligne confortable.';

  const levels = [
    { tag: 'Titre 1', spec: `${t.names.title} Bold · 32 / 38 pt`, style: sx(t.f.title(700), { fontSize: 32, lineHeight: 1.18 }), text: sampleTitle },
    { tag: 'Titre 2', spec: `${t.names.title} SemiBold · 22 / 28 pt`, style: sx(t.f.title(600), { fontSize: 22, lineHeight: 1.25 }), text: 'Un titre de section' },
    { tag: 'Titre 3', spec: `${t.names.title} SemiBold · 15 / 20 pt`, style: sx(t.f.title(600), { fontSize: 15, lineHeight: 1.3 }), text: 'Un sous-titre de paragraphe' },
    { tag: 'Paragraphe', spec: `${t.names.body} Regular · 10 / 16 pt`, style: sx(t.f.body(400), { fontSize: 10, lineHeight: 1.6 }), text: frTypo(sampleBody), maxLines: 4 },
    { tag: 'Légende', spec: `${t.names.body} Regular · 8 / 12 pt`, style: sx(t.f.body(400), { fontSize: 8, lineHeight: 1.5, color: t.c.muted }), text: 'Légende d’une image ou mention complémentaire.' },
    { tag: 'Accent', spec: `${t.names.accent} Medium · 10 pt`, style: sx(t.f.accent(500), { fontSize: 10, color: t.c.accentText }), text: '+ 42 % · 2026 · ÉDITION 01' },
  ];

  const rows = levels.map((l, i) =>
    h(
      View,
      {
        key: l.tag,
        style: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingVertical: SP.md + 2,
          borderTopWidth: i === 0 ? 0 : 0.5,
          borderColor: t.c.hairline,
        },
      },
      h(
        View,
        { style: { width: 130, paddingTop: 2 } },
        Txt(sx(t.text.label, { color: t.c.ink, marginBottom: 2 }), l.tag),
        Txt(sx(t.text.small, { fontSize: 7 }), l.spec)
      ),
      h(View, { style: { flex: 1 } }, Txt(sx({ color: t.c.ink }, l.style), l.text, l.maxLines ? { maxLines: l.maxLines } : {}))
    )
  );

  return ContentPage(
    ctx,
    {
      key: 'type-scale',
      section,
      title: 'Hiérarchie typographique',
      intro: 'Respectez ces tailles et interlignages pour garder une hiérarchie claire, du titre à la légende.',
    },
    Block(ctx, null, h(View, null, ...rows), { marginBottom: SP.lg }),
    Block(
      ctx,
      'Bonnes pratiques',
      h(
        View,
        { style: { flexDirection: 'row', gap: SP.lg } },
        ...[
          'Pas plus de deux polices sur un même support.',
          'Alignez le texte à gauche : évitez le justifié sur les écrans.',
          'Lignes de 60 à 75 caractères pour un confort de lecture optimal.',
        ].map((tip) =>
          h(
            View,
            { key: tip, style: { flex: 1, flexDirection: 'row' } },
            h(View, { style: { width: 5, height: 5, borderRadius: 3, backgroundColor: t.c.primary, marginTop: 4, marginRight: SP.sm } }),
            Txt(sx(t.text.small, { flex: 1, color: t.c.ink }), frTypo(tip))
          )
        )
      ),
      { marginBottom: 0 }
    )
  );
}
