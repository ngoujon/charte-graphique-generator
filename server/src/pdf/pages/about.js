import { View, Image } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, fit } from '../layout.js';
import { SP } from '../theme.js';
import { QWEBTY } from '../qwebty-brand.js';
import { frTypo } from '../text.js';

export function aboutPage(ctx, section) {
  const { t, qwebtyLogo } = ctx;
  return ContentPage(
    ctx,
    { key: 'about', section, title: 'À propos de Qwebty', bookmark: 'À propos de Qwebty' },
    h(
      View,
      { style: { flexDirection: 'row' } },
      h(
        View,
        { style: { flex: 1, paddingRight: SP.xxl } },
        ...QWEBTY.about.map((p, i) =>
          Txt(
            sx(t.text.body, { fontSize: i === 0 ? 11 : 9.5, lineHeight: 1.65, marginBottom: SP.md, color: i === 0 ? t.c.ink : t.c.muted }),
            frTypo(p),
            { key: i }
          )
        ),
        Txt(sx(t.f.title(600), { fontSize: 11, color: t.c.ink, marginTop: SP.md }), 'L’équipe Qwebty')
      ),
      h(
        View,
        { style: { width: 150 } },
        qwebtyLogo
          ? h(
              View,
              { style: { backgroundColor: '#ffffff', borderWidth: 0.75, borderColor: t.c.hairline, borderRadius: 6, padding: SP.lg, alignItems: 'center', marginBottom: SP.lg } },
              h(Image, { src: qwebtyLogo.src, style: fit(qwebtyLogo, 64, 64) })
            )
          : null,
        Txt(sx(t.text.label, { marginBottom: 2 }), 'Site web'),
        Txt(sx(t.text.body, { marginBottom: SP.md }), QWEBTY.url),
        Txt(sx(t.text.label, { marginBottom: 2 }), 'Expertises'),
        Txt(t.text.body, 'Sites vitrines, plateformes web, applications sur mesure, identité digitale.')
      )
    )
  );
}
