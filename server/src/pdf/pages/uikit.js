import { View } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, Block, LogoMark } from '../layout.js';
import { SP, PAGE } from '../theme.js';
import { mixHex, readableOn } from '../../../../shared/colors.js';
import { logoForBackground } from './cover.js';

const RADIUS = 6;

function button(ctx, label, variant = 'primary', size = 'md') {
  const { t } = ctx;
  const pad = size === 'sm' ? { paddingVertical: 5, paddingHorizontal: 10 } : { paddingVertical: 8, paddingHorizontal: 16 };
  const fontSize = size === 'sm' ? 8 : 9.5;
  const styles = {
    primary: { bg: t.c.primary, fg: t.c.onPrimary },
    secondary: { bg: t.c.secondary, fg: t.c.onSecondary },
    outline: { bg: 'transparent', fg: t.c.accentText, border: t.c.accentText },
    ghost: { bg: t.c.card, fg: t.c.ink },
    disabled: { bg: mixHex(t.c.ink, t.c.bg, 0.9), fg: t.c.subtle },
  }[variant];
  return h(
    View,
    {
      key: `${label}-${variant}-${size}`,
      style: {
        ...pad,
        backgroundColor: styles.bg,
        borderRadius: RADIUS,
        ...(styles.border ? { borderWidth: 1, borderColor: styles.border } : {}),
        alignItems: 'center',
      },
    },
    Txt(sx(t.f.body(600), { fontSize, color: styles.fg }), label)
  );
}

function field(ctx, { label, value, state }) {
  const { t } = ctx;
  const border = state === 'focus' ? t.c.primary : state === 'error' ? t.c.danger : mixHex(t.c.ink, t.c.bg, 0.78);
  return h(
    View,
    { key: label, style: { flex: 1 } },
    Txt(sx(t.f.body(500), { fontSize: 8, color: t.c.ink, marginBottom: 4 }), label),
    h(
      View,
      {
        style: {
          borderWidth: state === 'focus' ? 1.5 : 1,
          borderColor: border,
          borderRadius: RADIUS,
          paddingVertical: 7,
          paddingHorizontal: 10,
          backgroundColor: t.c.bg,
        },
      },
      Txt(sx(t.f.body(400), { fontSize: 9, color: state === 'placeholder' ? t.c.subtle : t.c.ink }), value)
    ),
    state === 'error'
      ? Txt(sx(t.f.body(400), { fontSize: 7, color: t.c.danger, marginTop: 3 }), 'Adresse e-mail invalide')
      : Txt(sx(t.f.body(400), { fontSize: 7, color: t.c.muted, marginTop: 3 }), state === 'focus' ? 'Champ actif' : ' ')
  );
}

function alert(ctx, { color, title, text, solid }) {
  const { t } = ctx;
  const bg = solid ? color : mixHex(color, t.c.bg, 0.88);
  const fg = solid ? readableOn(color) : t.c.ink;
  return h(
    View,
    {
      key: title,
      style: {
        flex: 1,
        backgroundColor: bg,
        borderRadius: RADIUS,
        borderLeftWidth: solid ? 0 : 3,
        borderLeftColor: color,
        padding: SP.md,
      },
    },
    Txt(sx(t.f.body(600), { fontSize: 9, color: fg, marginBottom: 2 }), title),
    Txt(sx(t.f.body(400), { fontSize: 8, color: fg, opacity: 0.85 }), text)
  );
}

export function uiKitPage(ctx, section) {
  const { t } = ctx;

  const buttons = h(
    View,
    null,
    h(
      View,
      { style: { flexDirection: 'row', gap: SP.sm, alignItems: 'center', marginBottom: SP.sm } },
      button(ctx, 'Action principale', 'primary'),
      button(ctx, 'Secondaire', 'secondary'),
      button(ctx, 'Contour', 'outline'),
      button(ctx, 'Discret', 'ghost'),
      button(ctx, 'Désactivé', 'disabled')
    ),
    h(
      View,
      { style: { flexDirection: 'row', gap: SP.sm, alignItems: 'center' } },
      button(ctx, 'Petit bouton', 'primary', 'sm'),
      button(ctx, 'Petit contour', 'outline', 'sm')
    )
  );

  const fields = h(
    View,
    { style: { flexDirection: 'row', gap: SP.lg } },
    field(ctx, { label: 'Nom', value: 'Votre nom', state: 'placeholder' }),
    field(ctx, { label: 'Entreprise', value: 'Nimbus & Co', state: 'focus' }),
    field(ctx, { label: 'E-mail', value: 'contact@exemple', state: 'error' })
  );

  const controls = h(
    View,
    { style: { flexDirection: 'row', gap: SP.xxl, alignItems: 'center' } },
    h(
      View,
      { style: { flexDirection: 'row', alignItems: 'center' } },
      h(
        View,
        { style: { width: 14, height: 14, borderRadius: 3, backgroundColor: t.c.primary, alignItems: 'center', justifyContent: 'center', marginRight: 6 } },
        h(View, {
          style: {
            width: 4,
            height: 7,
            borderRightWidth: 1.5,
            borderBottomWidth: 1.5,
            borderColor: t.c.onPrimary,
            transform: 'rotate(45deg)',
            marginTop: -2,
          },
        })
      ),
      Txt(sx(t.f.body(400), { fontSize: 9, color: t.c.ink }), 'Case cochée')
    ),
    h(
      View,
      { style: { flexDirection: 'row', alignItems: 'center' } },
      h(
        View,
        { style: { width: 14, height: 14, borderRadius: 7, borderWidth: 4, borderColor: t.c.primary, marginRight: 6 } }
      ),
      Txt(sx(t.f.body(400), { fontSize: 9, color: t.c.ink }), 'Option choisie')
    ),
    h(
      View,
      { style: { flexDirection: 'row', alignItems: 'center' } },
      h(
        View,
        { style: { width: 28, height: 16, borderRadius: 8, backgroundColor: t.c.primary, justifyContent: 'center', paddingLeft: 14, marginRight: 6 } },
        h(View, { style: { width: 12, height: 12, borderRadius: 6, backgroundColor: t.c.onPrimary } })
      ),
      Txt(sx(t.f.body(400), { fontSize: 9, color: t.c.ink }), 'Interrupteur')
    ),
    Txt(sx(t.f.body(500), { fontSize: 9, color: t.c.accentText, textDecoration: 'underline' }), 'Lien hypertexte')
  );

  const badges = h(
    View,
    { style: { flexDirection: 'row', gap: SP.sm } },
    ...[
      { label: 'Nouveau', bg: t.c.primary, fg: t.c.onPrimary },
      { label: 'Populaire', bg: t.c.secondary, fg: t.c.onSecondary },
      { label: 'Info', bg: mixHex(t.c.primary, t.c.bg, 0.85), fg: t.c.ink },
      { label: 'Brouillon', bg: t.c.card, fg: t.c.muted, border: true },
    ].map((b) =>
      h(
        View,
        {
          key: b.label,
          style: {
            backgroundColor: b.bg,
            borderRadius: 10,
            paddingVertical: 3,
            paddingHorizontal: 9,
            ...(b.border ? { borderWidth: 0.75, borderColor: t.c.hairline } : {}),
          },
        },
        Txt(sx(t.f.body(600), { fontSize: 7.5, color: b.fg }), b.label)
      )
    )
  );

  const alerts = h(
    View,
    { style: { flexDirection: 'row', gap: SP.md } },
    alert(ctx, { color: t.c.primary, title: 'Information', text: 'Message neutre aux couleurs de la marque.' }),
    alert(ctx, { color: t.c.secondary, title: 'Mise en avant', text: 'Pour attirer l’attention sur un point.' }),
    alert(ctx, { color: t.c.ink, title: 'Bandeau', text: 'Version pleine, très visible.', solid: true })
  );

  return ContentPage(
    ctx,
    {
      key: 'uikit-1',
      section,
      title: 'Composants d’interface',
      intro: 'Les éléments de base d’un site ou d’une application, déclinés aux couleurs et polices de la marque.',
    },
    Block(ctx, 'Boutons', buttons),
    Block(ctx, 'Champs de formulaire', fields),
    Block(ctx, 'Contrôles et liens', controls),
    Block(ctx, 'Étiquettes', badges),
    Block(ctx, 'Messages', alerts, { marginBottom: 0 })
  );
}

export function uiKitPage2(ctx, section) {
  const { t, projet } = ctx;
  const W = PAGE.contentWidth;

  const navLogo = logoForBackground(ctx, 'sombre', t.c.onInk);
  const navbar = h(
    View,
    {
      style: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: t.c.ink,
        borderRadius: RADIUS,
        paddingVertical: SP.md,
        paddingHorizontal: SP.lg,
      },
    },
    h(View, { style: { width: 110 } }, LogoMark(ctx, { img: navLogo, maxW: 100, maxH: 22, color: t.c.onInk, style: { textAlign: 'left' } })),
    h(
      View,
      { style: { flexDirection: 'row', gap: SP.lg, alignItems: 'center' } },
      ...['Accueil', 'Services', 'À propos', 'Contact'].map((m, i) =>
        Txt(sx(t.f.body(i === 0 ? 600 : 400), { fontSize: 8.5, color: t.c.onInk, opacity: i === 0 ? 1 : 0.75 }), m, { key: m })
      ),
      button(ctx, 'Nous écrire', 'primary', 'sm')
    )
  );

  const gap = SP.lg;
  const cw = (W - gap * 2) / 3;
  const cards = h(
    View,
    { style: { flexDirection: 'row', gap } },
    ...[
      { title: 'Offre essentielle', tone: t.c.primary },
      { title: 'Accompagnement', tone: t.c.secondary },
      { title: 'Sur mesure', tone: t.c.ink },
    ].map((c) =>
      h(
        View,
        { key: c.title, style: { width: cw, borderWidth: 0.75, borderColor: t.c.hairline, borderRadius: RADIUS, overflow: 'hidden', backgroundColor: t.c.bg } },
        h(View, { style: { height: 54, backgroundColor: mixHex(c.tone, t.c.bg, 0.2) } }),
        h(
          View,
          { style: { padding: SP.md } },
          Txt(sx(t.f.title(600), { fontSize: 11, color: t.c.ink, marginBottom: 3 }), c.title),
          Txt(sx(t.f.body(400), { fontSize: 7.5, lineHeight: 1.45, color: t.c.muted, marginBottom: SP.sm }), 'Une description courte qui présente le contenu de la carte.'),
          Txt(sx(t.f.body(600), { fontSize: 8, color: t.c.accentText }), 'En savoir plus  ›')
        )
      )
    )
  );

  const rows = [
    ['Référence', 'Statut', 'Montant'],
    ['CMD-0142', 'Validée', '1 250 €'],
    ['CMD-0143', 'En cours', '480 €'],
    ['CMD-0144', 'Brouillon', '2 030 €'],
  ];
  const table = h(
    View,
    { style: { borderWidth: 0.75, borderColor: t.c.hairline, borderRadius: RADIUS, overflow: 'hidden' } },
    ...rows.map((r, i) =>
      h(
        View,
        {
          key: r[0],
          style: {
            flexDirection: 'row',
            backgroundColor: i === 0 ? t.c.card : t.c.bg,
            borderTopWidth: i === 0 ? 0 : 0.5,
            borderTopColor: t.c.hairline,
          },
        },
        ...r.map((cell, j) =>
          Txt(
            sx(i === 0 ? t.text.label : t.f.body(400), {
              flex: 1,
              paddingVertical: 7,
              paddingHorizontal: SP.md,
              fontSize: i === 0 ? 6.8 : 8.5,
              color: i === 0 ? t.c.muted : j === 0 ? t.c.ink : t.c.ink,
              textAlign: j === 2 ? 'right' : 'left',
            }),
            cell
          )
        )
      )
    )
  );

  const progress = h(
    View,
    { style: { gap: SP.md } },
    ...[
      { label: 'Profil complété', value: 72, color: t.c.primary },
      { label: 'Objectif mensuel', value: 45, color: t.c.secondary },
    ].map((p) =>
      h(
        View,
        { key: p.label },
        h(
          View,
          { style: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 } },
          Txt(sx(t.f.body(500), { fontSize: 8, color: t.c.ink }), p.label),
          Txt(sx(t.f.accent(500), { fontSize: 8, color: t.c.muted }), `${p.value} %`)
        ),
        h(
          View,
          { style: { height: 6, borderRadius: 3, backgroundColor: mixHex(t.c.ink, t.c.bg, 0.9) } },
          h(View, { style: { width: `${p.value}%`, height: 6, borderRadius: 3, backgroundColor: p.color } })
        )
      )
    )
  );

  return ContentPage(
    ctx,
    {
      key: 'uikit-2',
      section,
      title: 'Exemples de mise en page',
      intro: `Les composants assemblés : un aperçu de l’univers de ${projet.nom || 'la marque'} sur un site ou une application.`,
    },
    Block(ctx, 'Barre de navigation', navbar),
    Block(ctx, 'Cartes', cards),
    h(
      View,
      { style: { flexDirection: 'row', gap: SP.xl } },
      h(View, { style: { flex: 1.3 } }, Block(ctx, 'Tableau', table, { marginBottom: 0 })),
      h(View, { style: { flex: 1 } }, Block(ctx, 'Progression', progress, { marginBottom: 0 }))
    )
  );
}
