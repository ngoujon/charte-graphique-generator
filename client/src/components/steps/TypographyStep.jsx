import { useId, useRef } from 'react';
import { StepIntro } from '../ui/Field';
import { Icon } from '../ui/Icon';
import { CATALOG_FONTS, STANDARD_FONTS, FONT_ROLES, CATEGORY_LABELS, fontDisplayName } from '@shared/fonts.js';
import { cssFontStack } from '../../hooks/useFontFaces';

const SAMPLES = {
  principale: (cfg) => cfg.projet?.nom || 'Un titre qui a du caractère',
  secondaire: () => 'Un texte courant clair et agréable à lire, même sur de longs paragraphes.',
  tertiaire: () => '0123456789 · « Citation » · +42 %',
};

function FontPicker({ role, value, onChange, customFonts, sample }) {
  const id = useId();
  const groups = [
    ...(customFonts?.length ? [{ label: CATEGORY_LABELS.custom, fonts: customFonts.map((f) => ({ id: f.id, label: f.label })) }] : []),
    ...['sans', 'serif', 'mono'].map((cat) => ({
      label: CATEGORY_LABELS[cat],
      fonts: CATALOG_FONTS.filter((f) => f.category === cat),
    })),
    { label: 'Polices standard (PDF)', fonts: STANDARD_FONTS },
  ];
  return (
    <div className="font-role">
      <div className="font-role-head">
        <label htmlFor={id}>
          <strong>{role.label}</strong>
          <span>{role.hint}</span>
        </label>
        <select id={id} className="field-control font-select" value={value} onChange={(e) => onChange(e.target.value)}>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.fonts.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <p
        className={`font-sample font-sample-${role.key}`}
        style={{ fontFamily: cssFontStack(value), fontWeight: role.key === 'principale' ? 700 : 400 }}
      >
        {sample}
      </p>
    </div>
  );
}

export function TypographyStep({ config, update, customFonts, onUploadFont, onDeleteFont }) {
  const fileRef = useRef(null);
  const typo = config.typographie || {};
  return (
    <>
      <StepIntro title="La typographie">
        Choisissez une police pour chaque rôle. Toutes sont intégrées au PDF : le rendu est identique partout.
      </StepIntro>
      <div className="font-roles">
        {FONT_ROLES.map((role) => (
          <FontPicker
            key={role.key}
            role={role}
            value={typo[role.key]}
            onChange={(v) => update('typographie', role.key, v)}
            customFonts={customFonts}
            sample={SAMPLES[role.key](config)}
          />
        ))}
      </div>

      <section className="sub-section">
        <h3 className="sub-title">Vos polices</h3>
        <p className="field-hint">Ajoutez la police de votre marque (.ttf, .otf ou .woff, 5 Mo maximum).</p>
        <input
          ref={fileRef}
          type="file"
          accept=".ttf,.otf,.woff"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onUploadFont(file);
          }}
        />
        <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={16} />
          Importer une police
        </button>
        {customFonts?.length > 0 && (
          <ul className="simple-list">
            {customFonts.map((f) => (
              <li key={f.id}>
                <span style={{ fontFamily: cssFontStack(f.id) }}>{fontDisplayName(f.id)}</span>
                <button type="button" className="icon-btn icon-btn-sm" onClick={() => onDeleteFont(f)} aria-label={`Supprimer la police ${f.label}`}>
                  <Icon name="trash" size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
