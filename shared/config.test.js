import { describe, it, expect } from 'vitest';
import { normalizeCouleurs, normalizeTypographie, normalizeConfig } from './config.js';

describe('normalizeCouleurs', () => {
  it('mappe les anciennes clés vers le schéma canonique', () => {
    expect(normalizeCouleurs({ fond: '#eee', texte: '#111', primaire: '#f00' })).toEqual({
      clair: '#eee',
      sombre: '#111',
      primaire: '#f00',
      secondaire: '#64748b',
    });
  });

  it('retourne les valeurs par défaut si entrée invalide', () => {
    expect(normalizeCouleurs(null).clair).toBe('#ffffff');
  });
});

describe('normalizeTypographie', () => {
  it('mappe titre/corps vers principale/secondaire', () => {
    expect(normalizeTypographie({ titre: 'Helvetica-Bold', corps: 'Times-Roman' })).toEqual({
      principale: 'Helvetica',
      secondaire: 'Times-Roman',
      tertiaire: 'Courier',
    });
  });

  it('conserve les polices custom', () => {
    expect(normalizeTypographie({ principale: 'custom:my-font-123' }).principale).toBe('custom:my-font-123');
  });
});

describe('normalizeConfig', () => {
  it('fusionne avec les valeurs par défaut', () => {
    const conf = normalizeConfig({ projet: { nom: 'Test' } });
    expect(conf.projet.nom).toBe('Test');
    expect(conf.sections.kitUi).toBe(true);
    expect(conf.version).toBe(1);
  });
});
