import { View, Image } from '@react-pdf/renderer';
import { h, sx, Txt, ContentPage, fit } from '../layout.js';
import { SP, PAGE } from '../theme.js';
import { prettyImageName } from '../images.js';

export const IMAGES_PER_PAGE = 6;

/** Découpe les images en pages (6 par page). */
export function chunkImages(images) {
  const pages = [];
  for (let i = 0; i < images.length; i += IMAGES_PER_PAGE) pages.push(images.slice(i, i + IMAGES_PER_PAGE));
  return pages;
}

export function graphicsPage(ctx, section, images, index, count) {
  const { t } = ctx;
  const W = PAGE.contentWidth;
  const n = images.length;
  const cols = n === 1 ? 1 : n <= 4 ? 2 : 3;
  const gap = SP.lg;
  const cw = (W - gap * (cols - 1)) / cols;
  const rowsCount = Math.ceil(n / cols);
  const boxH = n === 1 ? 420 : rowsCount <= 2 ? (cols === 2 ? 220 : 190) : 190;

  const cards = images.map((img) => {
    const size = fit(img, cw - SP.xl * 2, boxH - SP.xl * 2);
    return h(
      View,
      { key: img.name, style: { width: cw, marginBottom: SP.lg } },
      h(
        View,
        {
          style: {
            height: boxH,
            backgroundColor: t.c.card,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
          },
        },
        h(Image, { src: img.src, style: size })
      ),
      Txt(sx(t.text.small, { marginTop: SP.sm, color: t.c.ink }), prettyImageName(img.name))
    );
  });

  return ContentPage(
    ctx,
    {
      key: `graphics-${index}`,
      section,
      title: count > 1 ? `Éléments graphiques (${index + 1}/${count})` : 'Éléments graphiques',
      bookmark: count > 1 ? `Éléments graphiques ${index + 1}` : 'Éléments graphiques',
      intro: index === 0 ? 'Motifs, pictogrammes, illustrations et photographies qui complètent l’identité visuelle.' : null,
    },
    h(View, { style: { flexDirection: 'row', flexWrap: 'wrap', columnGap: gap } }, ...cards)
  );
}
