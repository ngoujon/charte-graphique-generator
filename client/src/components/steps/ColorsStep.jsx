import { useEffect, useState } from 'react';
import { StepIntro } from '../ui/Field';
import { parseColorInput } from '@shared/parseColorInput.js';
import { contrastRatio } from '@shared/contrastRatio.js';
import { tintScale } from '@shared/colors.js';
import { fontDisplayName } from '@shared/fonts.js';
import { cssFontStack } from '../../hooks/useFontFaces';

const COLORS = [
  { key: 'primaire', label: 'Principale', hint: 'Boutons, liens, éléments clés', def: '#2563eb' },
  { key: 'secondaire', label: 'Secondaire', hint: 'Accents et mises en avant', def: '#64748b' },
  { key: 'sombre', label: 'Sombre', hint: 'Titres et textes', def: '#1a1a1a' },
  { key: 'clair', label: 'Clair', hint: 'Fonds et respiration', def: '#ffffff' },
];

function ColorRow({ color, value, onChange }) {
  const valid = parseColorInput(value);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => setDraft(value || ''), [value]);
  const hex = valid || color.def;
  return (
    <div className="color-row">
      <label className="color-swatch" style={{ backgroundColor: hex }} title="Choisir une couleur">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`Couleur ${color.label}`}
        />
      </label>
      <div className="color-info">
        <strong>{color.label}</strong>
        <span>{color.hint}</span>
        <div className="tint-strip" aria-hidden="true">
          {tintScale(hex).map((t) => (
            <span key={t.key} style={{ backgroundColor: t.hex }} />
          ))}
        </div>
      </div>
      <input
        className={`field-control color-hex ${draft && !parseColorInput(draft) ? 'is-invalid' : ''}`}
        value={draft}
        spellCheck={false}
        aria-label={`Code couleur ${color.label} (HEX ou rgb)`}
        onChange={(e) => {
          setDraft(e.target.value);
          const parsed = parseColorInput(e.target.value);
          if (parsed) onChange(parsed);
        }}
        onBlur={() => setDraft(value || '')}
      />
    </div>
  );
}

const LEVELS = {
  AAA: { label: 'Excellent', cls: 'ok' },
  AA: { label: 'Bon', cls: 'ok' },
  large: { label: 'Titres seulement', cls: 'warn' },
  fail: { label: 'Peu lisible', cls: 'bad' },
};

function level(ratio) {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'large';
  return 'fail';
}

export function ColorsStep({ config, update, templates, onApplyTemplate }) {
  const c = config.couleurs || {};
  const get = (k, def) => parseColorInput(c[k]) || def;
  const clair = get('clair', '#ffffff');
  const sombre = get('sombre', '#1a1a1a');
  const pairs = [
    { label: 'Texte sombre sur fond clair', bg: clair, fg: sombre },
    { label: 'Principale sur fond clair', bg: clair, fg: get('primaire', '#2563eb') },
    { label: 'Secondaire sur fond clair', bg: clair, fg: get('secondaire', '#64748b') },
  ];

  return (
    <>
      <StepIntro title="Les couleurs">
        Quatre couleurs suffisent pour une identité forte. Cliquez sur une pastille ou saisissez un code HEX.
      </StepIntro>

      {templates?.length > 0 && (
        <section className="sub-section">
          <h3 className="sub-title">Partir d’un style</h3>
          <p className="field-hint">Applique des couleurs et des polices assorties. Vos textes ne changent pas.</p>
          <div className="style-grid">
            {templates.map((t) => (
              <button key={t.id} type="button" className="style-card" onClick={() => onApplyTemplate(t)}>
                <span className="style-swatches" aria-hidden="true">
                  {['primaire', 'secondaire', 'sombre', 'clair'].map((k) => (
                    <span key={k} style={{ backgroundColor: t.couleurs[k] }} />
                  ))}
                </span>
                <span className="style-name" style={{ fontFamily: cssFontStack(t.typographie.principale) }}>
                  {t.label}
                </span>
                <span className="style-desc">
                  {fontDisplayName(t.typographie.principale)} · {fontDisplayName(t.typographie.secondaire)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="sub-section">
        <h3 className="sub-title">Palette</h3>
        <div className="color-list">
          {COLORS.map((color) => (
            <ColorRow key={color.key} color={color} value={c[color.key]} onChange={(v) => update('couleurs', color.key, v)} />
          ))}
        </div>
      </section>

      <section className="sub-section">
        <h3 className="sub-title">Lisibilité</h3>
        <ul className="contrast-list">
          {pairs.map((p) => {
            const ratio = contrastRatio(p.bg, p.fg) ?? 1;
            const l = LEVELS[level(ratio)];
            return (
              <li key={p.label}>
                <span className="contrast-sample" style={{ backgroundColor: p.bg, color: p.fg }}>Aa</span>
                <span className="contrast-label">{p.label}</span>
                <span className={`badge badge-${l.cls}`}>
                  {l.label} · {ratio.toFixed(1)}:1
                </span>
              </li>
            );
          })}
        </ul>
        <p className="field-hint">Visez au moins 4,5:1 pour le texte courant (norme WCAG AA).</p>
      </section>
    </>
  );
}
