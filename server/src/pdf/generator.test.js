import { describe, it, expect } from 'vitest';
import { generatePdfBuffer, splitLogos } from './generator.js';
import { normalizeConfig } from '../../../shared/config.js';

describe('splitLogos', () => {
  it('sépare les logos des autres images', () => {
    const imgs = [{ name: 'logo-clair-1.png' }, { name: 'logo-sombre-2.png' }, { name: 'motif.png' }];
    const { logos, others } = splitLogos(imgs);
    expect(logos.clair.name).toBe('logo-clair-1.png');
    expect(logos.sombre.name).toBe('logo-sombre-2.png');
    expect(others.map((i) => i.name)).toEqual(['motif.png']);
  });
});

describe('generatePdfBuffer', () => {
  it('produit un PDF avec la carte des pages', async () => {
    const config = normalizeConfig({
      projet: { nom: 'Test' },
      marque: { slogan: 'Bonjour : le monde !', valeurs: 'A, B, C' },
      typographie: { principale: 'Playfair Display', secondaire: 'Inter', tertiaire: 'Courier' },
    });
    const { buffer, pageMap } = await generatePdfBuffer(config, []);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(pageMap).toMatchObject({ cover: 1, toc: 2, marque: 3, logo: 4, couleurs: 6, typographie: 8, kitUi: 10 });
    expect(pageMap.elementsGraphiques).toBeUndefined();
  });
});
