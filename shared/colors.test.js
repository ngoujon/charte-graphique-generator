import { describe, it, expect } from 'vitest';
import { hexToCmyk, readableOn, tintScale, mixHex } from './colors.js';

describe('colors', () => {
  it('convertit en CMJN', () => {
    expect(hexToCmyk('#000000')).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    expect(hexToCmyk('#ff0000')).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it('choisit le texte le plus lisible', () => {
    expect(readableOn('#111111')).toBe('#ffffff');
    expect(readableOn('#facc15')).toBe('#111111');
  });

  it('génère une échelle de nuances centrée sur la couleur de base', () => {
    const scale = tintScale('#6d28d9');
    expect(scale).toHaveLength(6);
    expect(scale.find((s) => s.base).hex).toBe('#6d28d9');
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080');
  });
});
