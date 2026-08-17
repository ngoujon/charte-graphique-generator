import { describe, it, expect } from 'vitest';
import { contrastRatio, wcagLevel } from './contrastRatio.js';

describe('contrastRatio', () => {
  it('noir sur blanc donne le ratio maximal (21)', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('couleur identique donne un ratio de 1', () => {
    expect(contrastRatio('#2563eb', '#2563eb')).toBeCloseTo(1, 5);
  });

  it('est symétrique', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeCloseTo(contrastRatio('#abcdef', '#123456'), 5);
  });

  it('retourne null pour une couleur invalide', () => {
    expect(contrastRatio('pas-une-couleur', '#ffffff')).toBeNull();
  });
});

describe('wcagLevel', () => {
  it('classe correctement AAA, AA et fail', () => {
    expect(wcagLevel(21)).toBe('AAA');
    expect(wcagLevel(5)).toBe('AA');
    expect(wcagLevel(2)).toBe('fail');
    expect(wcagLevel(null)).toBeNull();
  });
});
