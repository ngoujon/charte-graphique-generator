import { View } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage } from '../layout.js';
import { SP } from '../theme.js';
import { formatDateFr, frTypo } from '../text.js';

export function tocPage(ctx, entries) {
  const { t, projet } = ctx;
  const nom = projet.nom || 'la marque';

  const rows = entries.map((e, i) =>
    h(
      View,
      {
        key: e.label,
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: SP.md,
          borderTopWidth: i === 0 ? 0.5 : 0,
          borderBottomWidth: 0.5,
          borderColor: t.c.hairline,
        },
      },
      Txt(sx(t.f.accent(500), { fontSize: 10, color: t.c.accentText, width: 40 }), e.num),
      h(
        View,
        { style: { flex: 1 } },
        Txt(sx(t.f.title(600), { fontSize: 14, color: t.c.ink }), e.label),
        e.description ? Txt(sx(t.text.small, { marginTop: 2 }), e.description) : null
      ),
      Txt(sx(t.f.accent(500), { fontSize: 9, color: t.c.muted }), String(e.page).padStart(2, '0'))
    )
  );

  const metaItems = [
    ['Projet', projet.nom],
    ['Référence', projet.reference],
    ['Date', formatDateFr(projet.date)],
    ['Auteur', projet.auteur],
  ].filter(([, v]) => v);

  return ContentPage(
    ctx,
    { key: 'toc', title: 'Sommaire', bookmark: 'Sommaire' },
    h(
      View,
      { style: { flexDirection: 'row', marginBottom: SP.xxl } },
      h(
        View,
        { style: { flex: 1, paddingRight: SP.xxl } },
        Txt(sx(t.text.label, { marginBottom: SP.sm }), 'À propos de ce document'),
        Txt(
          t.text.body,
          frTypo(
            `Ce document rassemble les règles d'utilisation de l'identité visuelle de ${nom}. Il sert de référence à toutes les personnes qui créent des supports pour la marque, en interne comme en externe, afin de garantir une image cohérente et reconnaissable.`
          )
        ),
        projet.description ? Txt(sx(t.text.body, { marginTop: SP.sm, color: t.c.muted }), frTypo(projet.description)) : null
      ),
      h(
        View,
        { style: { width: 170 } },
        ...metaItems.map(([k, v], i) =>
          h(
            View,
            { key: k, style: { marginBottom: i === metaItems.length - 1 ? 0 : SP.sm } },
            Txt(sx(t.text.label, { marginBottom: 1 }), k),
            Txt(sx(t.text.body, { fontSize: 9 }), v)
          )
        )
      )
    ),
    ...rows
  );
}
