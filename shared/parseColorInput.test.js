import { describe, it, expect } from 'vitest';
import { parseColorInput } from './parseColorInput.js';

describe('parseColorInput', () => {
  it('parse hex 6 caractères', () => {
    expect(parseColorInput('#FF0000')).toBe('#ff0000');
    expect(parseColorInput('ff0000')).toBe('#ff0000');
  });

  it('parse hex 3 caractères', () => {
    expect(parseColorInput('#f00')).toBe('#ff0000');
  });

  it('parse rgb()', () => {
    expect(parseColorInput('rgb(255, 0, 128)')).toBe('#ff0080');
  });

  it('retourne null pour entrée invalide', () => {
    expect(parseColorInput('not-a-color')).toBeNull();
  });
});
