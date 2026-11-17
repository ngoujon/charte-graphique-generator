import { View } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, Block, SpecRow, Pill } from '../layout.js';
import { SP, PAGE } from '../theme.js';
import { formatRgb, formatCmyk, tintScale, readableOn, isLightColor } from '../../../../shared/colors.js';
import { contrastRatio } from '../../../../shared/contrastRatio.js';

function palette(t) {
  return [
    { key: 'primaire', name: 'Principale', hex: t.c.primary, usage: 'Couleur signature : boutons, liens, éléments clés.', share: 10 },
    { key: 'secondaire', name: 'Secondaire', hex: t.c.secondary, usage: 'Accents, illustrations, mises en avant.', share: 5 },
    { key: 'sombre', name: 'Sombre', hex: t.c.ink, usage: 'Titres et textes, fonds contrastés.', share: 25 },
    { key: 'clair', name: 'Clair', hex: t.c.bg, usage: 'Fonds et espaces de respiration.', share: 60 },
  ];
}

function colorCard(ctx, col, { width, swatchH }) {
  const { t } = ctx;
  const fg = readableOn(col.hex);
  return h(
    View,
    { key: col.key, style: { width } },
    h(
      View,
      {
        style: {
          height: swatchH,
          backgroundColor: col.hex,
          borderRadius: 6,
          padding: SP.lg,
          justifyContent: 'space-between',
          ...(isLightColor(col.hex) || col.hex === t.c.bg ? { borderWidth: 0.75, borderColor: t.c.hairline } : {}),
        },
      },
      Txt(sx(t.f.title(600), { fontSize: 15, color: fg }), col.name),
      Txt(sx(t.f.accent(500), { fontSize: 10, color: fg, opacity: 0.85 }), col.hex.toUpperCase())
    ),
    h(
      View,
      { style: { marginTop: SP.sm } },
      SpecRow(ctx, 'HEX', col.hex.toUpperCase()),
      SpecRow(ctx, 'RVB', formatRgb(col.hex)),
      SpecRow(ctx, 'CMJN', formatCmyk(col.hex), { last: true }),
      Txt(sx(t.text.small, { marginTop: SP.sm }), col.usage)
    )
  );
}

export function colorsPage(ctx, section) {
  const { t } = ctx;
  const cols = palette(t);
  const gap = SP.lg;
  const W = PAGE.contentWidth;
  const big = (W - gap) / 2;

  const proportion = h(
    View,
    null,
    h(
      View,
      { style: { flexDirection: 'row', height: 26, borderRadius: 4, overflow: 'hidden', borderWidth: 0.75, borderColor: t.c.hairline } },
      ...[...cols].reverse().map((c) => h(View, { key: c.key, style: { flex: c.share, backgroundColor: c.hex } }))
    ),
    h(
      View,
      { style: { flexDirection: 'row', gap: SP.lg, marginTop: SP.sm } },
      ...[...cols].reverse().map((c) =>
        h(
          View,
          { key: c.key, style: { flexDirection: 'row', alignItems: 'center' } },
          h(View, { style: { width: 7, height: 7, borderRadius: 4, backgroundColor: c.hex, borderWidth: 0.5, borderColor: t.c.hairline, marginRight: 4 } }),
          Txt(sx(t.text.small, { fontSize: 7.5, color: t.c.ink }), `${c.name} ${c.share}\u00A0%`)
        )
      )
    )
  );

  return ContentPage(
    ctx,
    {
      key: 'colors',
      section,
      title: 'Palette de couleurs',
      intro: 'Quatre couleurs composent l’identité. Utilisez les valeurs ci-dessous : RVB/HEX pour les écrans, CMJN pour l’impression.',
    },
    h(View, { style: { flexDirection: 'row', gap, marginBottom: SP.xl } }, colorCard(ctx, cols[0], { width: big, swatchH: 150 }), colorCard(ctx, cols[1], { width: big, swatchH: 150 })),
    h(View, { style: { flexDirection: 'row', gap, marginBottom: SP.xl } }, colorCard(ctx, cols[2], { width: big, swatchH: 72 }), colorCard(ctx, cols[3], { width: big, swatchH: 72 })),
    Block(ctx, 'Répartition recommandée', proportion, { marginBottom: SP.sm }),
    Txt(sx(t.text.small, { fontSize: 7 }), 'Valeurs CMJN indicatives (conversion sans profil colorimétrique) : à valider avec votre imprimeur.')
  );
}

function wcagBadge(ctx, ratio) {
  const { t } = ctx;
  if (ratio >= 7) return Pill(ctx, `AAA · ${ratio.toFixed(1)}:1`, { bg: '#dcfae6', color: '#067647' });
  if (ratio >= 4.5) return Pill(ctx, `AA · ${ratio.toFixed(1)}:1`, { bg: '#dcfae6', color: '#067647' });
  if (ratio >= 3) return Pill(ctx, `Grands textes · ${ratio.toFixed(1)}:1`, { bg: '#fef0c7', color: t.c.warning });
  return Pill(ctx, `À éviter · ${ratio.toFixed(1)}:1`, { bg: '#fee4e2', color: t.c.danger });
}

export function colorDetailsPage(ctx, section) {
  const { t } = ctx;
  const W = PAGE.contentWidth;
  const labelW = 74;

  const scales = [
    { name: 'Principale', hex: t.c.primary },
    { name: 'Secondaire', hex: t.c.secondary },
    { name: 'Sombre', hex: t.c.ink },
  ].map((s) => {
    const steps = tintScale(s.hex);
    const sw = (W - labelW) / steps.length;
    return h(
      View,
      { key: s.name, style: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SP.md } },
      h(View, { style: { width: labelW, paddingTop: 12 } }, Txt(t.text.h3, s.name)),
      ...steps.map((st) =>
        h(
          View,
          { key: st.key, style: { width: sw } },
          h(View, {
            style: {
              height: 40,
              backgroundColor: st.hex,
              ...(st.base ? { borderWidth: 1.5, borderColor: t.c.ink } : {}),
            },
          }),
          Txt(sx(t.f.accent(500), { fontSize: 6.5, color: t.c.ink, marginTop: 3 }), st.key),
          Txt(sx(t.f.accent(400), { fontSize: 6.5, color: t.c.muted }), st.hex.toUpperCase())
        )
      )
    );
  });

  const pairs = [
    { bg: t.c.bg, fg: t.c.ink, label: 'Sombre sur clair' },
    { bg: t.c.bg, fg: t.c.primary, label: 'Principale sur clair' },
    { bg: t.c.bg, fg: t.c.secondary, label: 'Secondaire sur clair' },
    { bg: t.c.ink, fg: t.c.bg, label: 'Clair sur sombre' },
    { bg: t.c.primary, fg: t.c.bg, label: 'Clair sur principale' },
    { bg: t.c.secondary, fg: t.c.ink, label: 'Sombre sur secondaire' },
  ];
  const gap = SP.md;
  const pw = (W - gap * 2) / 3;
  const pairsGrid = h(
    View,
    { style: { flexDirection: 'row', flexWrap: 'wrap', gap } },
    ...pairs.map((p) => {
      const ratio = contrastRatio(p.bg, p.fg) ?? 1;
      return h(
        View,
        { key: p.label, style: { width: pw, marginBottom: SP.sm } },
        h(
          View,
          {
            style: {
              height: 64,
              backgroundColor: p.bg,
              borderRadius: 6,
              padding: SP.md,
              justifyContent: 'center',
              borderWidth: 0.75,
              borderColor: t.c.hairline,
            },
          },
          Txt(sx(t.f.title(700), { fontSize: 20, color: p.fg }), 'Aa'),
          Txt(sx(t.f.body(400), { fontSize: 8, color: p.fg }), 'Texte d’exemple')
        ),
        h(
          View,
          { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SP.xs + 2 } },
          Txt(sx(t.text.small, { color: t.c.ink }), p.label),
          wcagBadge(ctx, ratio)
        )
      );
    })
  );

  return ContentPage(
    ctx,
    {
      key: 'color-details',
      section,
      title: 'Nuances et accessibilité',
      intro: 'Les nuances étendent la palette pour les fonds, les survols et les états. Les associations ci-dessous indiquent leur lisibilité selon les normes WCAG.',
    },
    Block(ctx, 'Nuances', h(View, null, ...scales)),
    Block(ctx, 'Contrastes du texte', pairsGrid, { marginBottom: SP.sm }),
    Txt(
      sx(t.text.small, { fontSize: 7 }),
      'AA : ratio d’au moins 4,5:1 pour le texte courant · AAA : 7:1 · Grands textes : 3:1 (titres de 18 pt et plus).'
    )
  );
}
