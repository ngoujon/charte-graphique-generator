import React from 'react';
import { Page, View, Text, Image } from '@react-pdf/renderer';
import { PAGE, SP } from './theme.js';
import { QWEBTY } from './qwebty-brand.js';

export const h = React.createElement;

/** Fusionne des styles en ignorant les valeurs falsy. */
export const sx = (...styles) => Object.assign({}, ...styles.filter(Boolean));

/** Calcule une taille qui tient dans maxW × maxH en conservant les proportions. */
export function fit(img, maxW, maxH) {
  if (!img?.width || !img?.height) return { width: maxW, height: maxH };
  const ratio = Math.min(maxW / img.width, maxH / img.height);
  return { width: img.width * ratio, height: img.height * ratio };
}

export function Txt(style, children, extra = {}) {
  return h(Text, { style, ...extra }, children);
}

/** Pied de page fixe : nom du projet à gauche, crédit au centre, pagination à droite. */
function Footer(ctx) {
  const { t, projet } = ctx;
  const left = [projet.nom || 'Charte graphique', 'Charte graphique'].filter(Boolean).join('  ·  ');
  return h(
    View,
    {
      fixed: true,
      style: {
        position: 'absolute',
        left: PAGE.marginX,
        right: PAGE.marginX,
        bottom: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 0.5,
        borderTopColor: t.c.hairline,
        paddingTop: SP.sm,
      },
    },
    Txt(sx(t.text.small, { fontSize: 7 }), left),
    Txt(sx(t.text.small, { fontSize: 6.5, color: t.c.subtle }), `${QWEBTY.credit}  ·  ${QWEBTY.url}`),
    h(Text, {
      style: sx(t.f.accent(500), { fontSize: 7.5, color: t.c.ink }),
      render: ({ pageNumber, totalPages }) =>
        `${String(pageNumber).padStart(2, '0')} / ${String(totalPages).padStart(2, '0')}`,
    })
  );
}

/** En-tête de section : numéro + nom de la section, puis titre et introduction. */
function Heading(ctx, { section, title, intro }) {
  const { t } = ctx;
  return h(
    View,
    { style: { marginBottom: SP.xl } },
    h(
      View,
      { style: { flexDirection: 'row', alignItems: 'center', marginBottom: SP.lg } },
      h(View, { style: { width: 18, height: 2.5, backgroundColor: t.c.primary, marginRight: SP.sm } }),
      Txt(t.text.eyebrow, section ? `${section.num}  —  ${section.label}` : '')
    ),
    Txt(sx(t.text.h1, { marginBottom: intro ? SP.sm : 0 }), title),
    intro ? Txt(sx(t.text.lead, { maxWidth: 400 }), intro) : null
  );
}

/** Page de contenu standard (marges, fond, en-tête de section, pied de page). */
export function ContentPage(ctx, { key, section, title, intro, bookmark }, ...children) {
  const { t } = ctx;
  return h(
    Page,
    {
      key,
      size: 'A4',
      bookmark: bookmark || title,
      style: {
        backgroundColor: t.c.bg,
        paddingTop: PAGE.marginTop,
        paddingBottom: PAGE.marginBottom,
        paddingHorizontal: PAGE.marginX,
        ...t.f.body(400),
        color: t.c.ink,
      },
    },
    Heading(ctx, { section, title, intro }),
    ...children,
    Footer(ctx)
  );
}

/** Bloc titré à l'intérieur d'une page. */
export function Block(ctx, title, content, style) {
  const { t } = ctx;
  return h(
    View,
    { style: sx({ marginBottom: SP.xl }, style) },
    title ? Txt(sx(t.text.label, { marginBottom: SP.sm }), title) : null,
    content
  );
}

/** Logo (image) ou, à défaut, le nom du projet composé dans la police des titres. */
export function LogoMark(ctx, { img, maxW, maxH, color, style }) {
  const { t, projet } = ctx;
  if (img) {
    const size = fit(img, maxW, maxH);
    return h(Image, { src: img.src, style: sx(size, style) });
  }
  const name = projet.nom || 'Logo';
  const fontSize = Math.max(10, Math.min(maxH * 0.55, (maxW / Math.max(name.length, 4)) * 1.6));
  return Txt(sx(t.f.title(700), { fontSize, color: color || t.c.ink, letterSpacing: -0.3, textAlign: 'center' }, style), name);
}

/** Petite pastille de statut (AA, AAA, À éviter…). */
export function Pill(ctx, label, { bg, color, style } = {}) {
  const { t } = ctx;
  return h(
    View,
    {
      style: sx(
        { backgroundColor: bg || t.c.card, borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6, alignSelf: 'flex-start' },
        style
      ),
    },
    Txt(sx(t.f.body(600), { fontSize: 6.5, letterSpacing: 0.4, color: color || t.c.ink }), label)
  );
}

/** Ligne « libellé … valeur » utilisée dans les fiches techniques. */
export function SpecRow(ctx, label, value, { last = false } = {}) {
  const { t } = ctx;
  return h(
    View,
    {
      style: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3.5,
        borderBottomWidth: last ? 0 : 0.5,
        borderBottomColor: t.c.hairline,
      },
    },
    Txt(sx(t.text.label, { fontSize: 6.5 }), label),
    Txt(t.text.value, value)
  );
}
