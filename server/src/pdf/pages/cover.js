import { Page, View } from '@react-pdf/renderer';
import { h, sx, Txt, LogoMark } from '../layout.js';
import { PAGE, SP } from '../theme.js';
import { QWEBTY } from '../qwebty-brand.js';
import { formatDateFr, frTypo } from '../text.js';

/** Choisit le logo le mieux adapté à un fond (selon que le texte lisible y est clair ou foncé). */
export function logoForBackground(ctx, bgKey, textOnBg) {
  const { logos, t } = ctx;
  if (logos[bgKey]) return logos[bgKey];
  const lightText = textOnBg.toLowerCase() === '#ffffff' || textOnBg === t.c.bg;
  return lightText ? logos.sombre || null : logos.clair || null;
}

function stripe(t) {
  return h(
    View,
    { style: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 10, flexDirection: 'row' } },
    h(View, { style: { flex: 5, backgroundColor: t.c.secondary } }),
    h(View, { style: { flex: 3, backgroundColor: t.c.ink } }),
    h(View, { style: { flex: 2, backgroundColor: t.c.bg } })
  );
}

export function coverPage(ctx) {
  const { t, projet, marque } = ctx;
  const fg = t.c.onPrimary;
  const logo = logoForBackground(ctx, 'primaire', fg);
  const meta = [projet.reference, formatDateFr(projet.date)].filter(Boolean).join('   ·   ');

  return h(
    Page,
    {
      key: 'cover',
      size: 'A4',
      bookmark: 'Couverture',
      style: { backgroundColor: t.c.primary, padding: 0, color: fg },
    },
    h(
      View,
      {
        style: {
          flex: 1,
          paddingTop: 56,
          paddingBottom: 64,
          paddingHorizontal: PAGE.marginX + 4,
          justifyContent: 'space-between',
        },
      },
      h(
        View,
        { style: { flexDirection: 'row', justifyContent: 'space-between' } },
        Txt(sx(t.text.eyebrow, { color: fg, fontSize: 8, letterSpacing: 2.2 }), 'Charte graphique'),
        Txt(sx(t.f.accent(400), { fontSize: 8, color: fg, opacity: 0.8 }), meta)
      ),
      h(
        View,
        null,
        logo
          ? h(View, { style: { marginBottom: SP.xxl } }, LogoMark(ctx, { img: logo, maxW: 220, maxH: 90 }))
          : null,
        h(View, { style: { width: 40, height: 3, backgroundColor: fg, marginBottom: SP.xl, opacity: 0.9 } }),
        Txt(sx(t.text.display, { color: fg, fontSize: 48, marginBottom: SP.lg, maxWidth: 440 }), projet.nom || 'Mon projet'),
        marque.slogan
          ? Txt(sx(t.f.body(400), { fontSize: 15, lineHeight: 1.4, color: fg, opacity: 0.88, maxWidth: 400 }), frTypo(marque.slogan))
          : null
      ),
      h(
        View,
        { style: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' } },
        h(
          View,
          null,
          projet.auteur ? Txt(sx(t.text.label, { color: fg, opacity: 0.7, marginBottom: 3 }), 'Préparé par') : null,
          projet.auteur ? Txt(sx(t.f.body(500), { fontSize: 10, color: fg }), projet.auteur) : null
        ),
        Txt(sx(t.f.body(400), { fontSize: 7, color: fg, opacity: 0.65 }), `${QWEBTY.credit} · ${QWEBTY.url}`)
      )
    ),
    stripe(t)
  );
}

export function backCoverPage(ctx) {
  const { t, projet, marque } = ctx;
  const fg = t.c.onInk;
  const logo = logoForBackground(ctx, 'sombre', fg);
  return h(
    Page,
    { key: 'back-cover', size: 'A4', bookmark: 'Quatrième de couverture', style: { backgroundColor: t.c.ink, padding: 0 } },
    h(
      View,
      { style: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 80 } },
      LogoMark(ctx, { img: logo, maxW: 200, maxH: 80, color: fg }),
      marque.slogan
        ? Txt(sx(t.f.body(400), { fontSize: 11, color: fg, opacity: 0.75, marginTop: SP.xl, textAlign: 'center' }), frTypo(marque.slogan))
        : null
    ),
    h(
      View,
      { style: { position: 'absolute', left: 0, right: 0, bottom: 40, alignItems: 'center' } },
      Txt(
        sx(t.f.body(400), { fontSize: 7, color: fg, opacity: 0.55, letterSpacing: 0.6 }),
        ['Charte graphique', projet.reference, formatDateFr(projet.date)].filter(Boolean).join('  ·  ')
      )
    )
  );
}
