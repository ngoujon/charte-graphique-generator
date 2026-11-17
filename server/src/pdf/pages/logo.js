import { View } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, Block, LogoMark, Pill } from '../layout.js';
import { SP, PAGE } from '../theme.js';
import { mixHex } from '../../../../shared/colors.js';

function variants(ctx) {
  const { t, logos } = ctx;
  return [
    { key: 'clair', name: 'Version principale', usage: 'Sur fond clair : documents, site web, papeterie.', bg: t.c.bg, fg: t.c.ink, border: true, img: logos.clair },
    { key: 'sombre', name: 'Version négative', usage: 'Sur fond sombre : visuels, vidéos, réseaux sociaux.', bg: t.c.ink, fg: t.c.onInk, img: logos.sombre },
    { key: 'primaire', name: 'Sur couleur principale', usage: 'Sur aplat de la couleur principale.', bg: t.c.primary, fg: t.c.onPrimary, img: logos.primaire },
    { key: 'secondaire', name: 'Sur couleur secondaire', usage: 'Sur aplat de la couleur secondaire.', bg: t.c.secondary, fg: t.c.onSecondary, img: logos.secondaire },
  ];
}

export function logoVariantsPage(ctx, section) {
  const { t } = ctx;
  const gap = SP.lg;
  const w = (PAGE.contentWidth - gap) / 2;
  const missing = variants(ctx).filter((v) => !v.img).length;

  const cards = variants(ctx).map((v) =>
    h(
      View,
      { key: v.key, style: { width: w, marginBottom: SP.xl } },
      h(
        View,
        {
          style: {
            height: 168,
            backgroundColor: v.bg,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            padding: SP.xl,
            ...(v.border ? { borderWidth: 0.75, borderColor: t.c.hairline } : {}),
          },
        },
        LogoMark(ctx, { img: v.img, maxW: w * 0.62, maxH: 78, color: v.fg })
      ),
      h(
        View,
        { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SP.md, marginBottom: 3 } },
        Txt(t.text.h3, v.name),
        v.img ? null : Pill(ctx, 'À fournir', { bg: t.c.card, color: t.c.muted })
      ),
      Txt(t.text.small, v.usage)
    )
  );

  return ContentPage(
    ctx,
    {
      key: 'logo-variants',
      section,
      title: 'Le logo et ses déclinaisons',
      intro:
        "Le logo est la signature de la marque. Il existe en plusieurs versions pour rester lisible sur tous les fonds : choisissez toujours celle qui offre le meilleur contraste.",
    },
    h(View, { style: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' } }, ...cards),
    missing
      ? Txt(sx(t.text.small, { marginTop: -SP.sm }), 'Les versions marquées « À fournir » sont simulées avec le nom du projet en attendant le fichier définitif.')
      : null
  );
}

function crossBadge(ctx) {
  return h(
    View,
    {
      style: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: ctx.t.c.danger,
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    Txt(sx(ctx.t.f.body(700), { fontSize: 8, color: '#ffffff', marginTop: -1 }), '×')
  );
}

export function logoRulesPage(ctx, section) {
  const { t, logos } = ctx;
  const main = logos.clair || null;
  const W = PAGE.contentWidth;

  // Zone de protection
  const protection = h(
    View,
    { style: { flexDirection: 'row', alignItems: 'center' } },
    h(
      View,
      {
        style: {
          width: 250,
          height: 170,
          backgroundColor: t.c.card,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
      h(
        View,
        {
          style: {
            borderWidth: 0.75,
            borderStyle: 'dashed',
            borderColor: t.c.accentText,
            padding: 22,
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        LogoMark(ctx, { img: main, maxW: 150, maxH: 56 })
      )
    ),
    h(
      View,
      { style: { flex: 1, paddingLeft: SP.xl } },
      Txt(sx(t.text.h2, { marginBottom: SP.sm }), 'Zone de protection'),
      Txt(
        t.text.body,
        "Gardez toujours un espace libre autour du logo, au moins égal au quart de la hauteur du logo (zone en pointillés). Aucun texte, image ou bord de page ne doit entrer dans cette zone."
      )
    )
  );

  // Tailles minimales
  const minSizes = h(
    View,
    { style: { flexDirection: 'row', gap: SP.lg } },
    ...[
      { label: 'Impression', value: '25 mm de large', w: 71 },
      { label: 'Écran', value: '120 px de large', w: 90 },
    ].map((s) =>
      h(
        View,
        {
          key: s.label,
          style: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 0.75,
            borderColor: t.c.hairline,
            borderRadius: 6,
            padding: SP.lg,
          },
        },
        h(View, { style: { width: 100, alignItems: 'center' } }, LogoMark(ctx, { img: main, maxW: s.w, maxH: 28 })),
        h(
          View,
          { style: { marginLeft: SP.md } },
          Txt(sx(t.text.label, { marginBottom: 2 }), s.label),
          Txt(sx(t.f.title(600), { fontSize: 12, color: t.c.ink }), s.value)
        )
      )
    )
  );

  // Usages à éviter
  const lowContrastBg = mixHex(t.c.primary, t.c.bg, 0.55);
  const donts = [
    { label: 'Ne pas déformer', render: () => h(View, { style: { transform: 'scaleX(1.35) scaleY(0.7)' } }, LogoMark(ctx, { img: main, maxW: 76, maxH: 30 })) },
    { label: 'Ne pas pivoter', render: () => h(View, { style: { transform: 'rotate(-14deg)' } }, LogoMark(ctx, { img: main, maxW: 100, maxH: 36 })) },
    { label: 'Ne pas modifier l’opacité', render: () => h(View, { style: { opacity: 0.3 } }, LogoMark(ctx, { img: main, maxW: 100, maxH: 36 })) },
    { label: 'Éviter les fonds peu contrastés', bg: lowContrastBg, render: () => LogoMark(ctx, { img: logos.clair, maxW: 100, maxH: 36, color: mixHex(t.c.primary, t.c.bg, 0.35) }) },
  ];
  const gap = SP.md;
  const dw = (W - gap * 3) / 4;
  const dontsRow = h(
    View,
    { style: { flexDirection: 'row', gap } },
    ...donts.map((d) =>
      h(
        View,
        { key: d.label, style: { width: dw } },
        h(
          View,
          {
            style: {
              height: 110,
              borderRadius: 6,
              backgroundColor: d.bg || t.c.card,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            },
          },
          d.render(),
          crossBadge(ctx)
        ),
        Txt(sx(t.text.small, { marginTop: SP.sm, color: t.c.ink }), d.label)
      )
    )
  );

  return ContentPage(
    ctx,
    {
      key: 'logo-rules',
      section,
      title: 'Règles d’utilisation du logo',
      intro: 'Quelques règles simples garantissent que le logo reste lisible et reconnaissable, quel que soit le support.',
    },
    Block(ctx, null, protection),
    Block(ctx, 'Taille minimale', minSizes),
    Block(ctx, 'À éviter', dontsRow, { marginBottom: 0 })
  );
}
