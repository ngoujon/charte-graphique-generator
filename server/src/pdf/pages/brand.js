import { View } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, Block } from '../layout.js';
import { SP, PAGE } from '../theme.js';
import { frTypo, splitList } from '../text.js';

export function brandPage(ctx, section) {
  const { t, marque, projet } = ctx;
  const valeurs = splitList(marque.valeurs).slice(0, 6);
  const traits = splitList(marque.personnalite)
    .slice(0, 8)
    .map((tr) => tr.charAt(0).toUpperCase() + tr.slice(1));

  const slogan = marque.slogan
    ? h(
        View,
        {
          style: {
            borderLeftWidth: 3,
            borderLeftColor: t.c.primary,
            paddingLeft: SP.lg,
            paddingVertical: SP.xs,
            marginBottom: SP.xxl,
          },
        },
        Txt(sx(t.text.label, { marginBottom: SP.sm }), 'Signature'),
        Txt(sx(t.f.title(600), { fontSize: 22, lineHeight: 1.25, color: t.c.ink }), `«\u00A0${frTypo(marque.slogan)}\u00A0»`)
      )
    : null;

  const mission = marque.mission
    ? Block(ctx, 'Mission', Txt(sx(t.text.body, { fontSize: 11, lineHeight: 1.6 }), frTypo(marque.mission), { maxLines: 8 }))
    : null;

  const cols = valeurs.length <= 3 ? valeurs.length : valeurs.length === 4 ? 2 : 3;
  const gap = SP.md;
  const cardW = cols ? (PAGE.contentWidth - gap * (cols - 1)) / cols : 0;
  const valeursBlock = valeurs.length
    ? Block(
        ctx,
        'Valeurs',
        h(
          View,
          { style: { flexDirection: 'row', flexWrap: 'wrap', gap } },
          ...valeurs.map((v, i) =>
            h(
              View,
              {
                key: v,
                style: {
                  width: cardW,
                  backgroundColor: t.c.card,
                  borderRadius: 6,
                  padding: SP.lg,
                  minHeight: 64,
                },
              },
              Txt(sx(t.f.accent(500), { fontSize: 8, color: t.c.accentText, marginBottom: SP.sm }), String(i + 1).padStart(2, '0')),
              Txt(sx(t.f.title(600), { fontSize: 13, color: t.c.ink }), v)
            )
          )
        )
      )
    : null;

  const traitsBlock = traits.length
    ? Block(
        ctx,
        'Personnalité',
        h(
          View,
          { style: { flexDirection: 'row', flexWrap: 'wrap', gap: SP.sm } },
          ...traits.map((tr) =>
            h(
              View,
              {
                key: tr,
                style: {
                  borderWidth: 0.75,
                  borderColor: t.c.hairline,
                  borderRadius: 12,
                  paddingVertical: 4,
                  paddingHorizontal: 10,
                },
              },
              Txt(sx(t.f.body(500), { fontSize: 9, color: t.c.ink }), tr)
            )
          )
        )
      )
    : null;

  const demarche = marque.recherche
    ? Block(ctx, 'Démarche créative', Txt(sx(t.text.body, { color: t.c.muted }), frTypo(marque.recherche), { maxLines: 12 }))
    : null;

  const nothing = !slogan && !mission && !valeursBlock && !traitsBlock && !demarche;

  return ContentPage(
    ctx,
    {
      key: 'brand',
      section,
      title: 'Identité de la marque',
      intro: frTypo(
        `Qui est ${projet.nom || 'la marque'}, ce qu'elle défend et la façon dont elle s'exprime. Ces repères guident tous les choix visuels qui suivent.`
      ),
    },
    slogan,
    mission,
    valeursBlock,
    traitsBlock,
    demarche,
    nothing ? Txt(t.text.small, 'Complétez la section « Marque » pour présenter votre identité.') : null
  );
}
