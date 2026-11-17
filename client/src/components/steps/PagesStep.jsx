import { StepIntro } from '../ui/Field';

const PDF_SECTIONS = [
  { key: 'marque', label: 'Identité de la marque', desc: 'Signature, mission, valeurs, personnalité', pages: 1 },
  { key: 'logo', label: 'Logo', desc: 'Déclinaisons et règles d’utilisation', pages: 2 },
  { key: 'couleurs', label: 'Couleurs', desc: 'Palette, nuances, contrastes', pages: 2 },
  { key: 'typographie', label: 'Typographie', desc: 'Familles et hiérarchie des textes', pages: 2 },
  { key: 'kitUi', label: 'Interface', desc: 'Boutons, formulaires, cartes, navigation', pages: 2 },
  { key: 'elementsGraphiques', label: 'Éléments graphiques', desc: 'Galerie de vos images', pages: null },
  { key: 'aboutQwebty', label: 'À propos de Qwebty', desc: 'Présentation du studio', pages: 1 },
];

export function PagesStep({ config, setSection, imagesCount }) {
  const sections = config.sections || {};
  const enabled = PDF_SECTIONS.filter((s) => sections[s.key] !== false);
  const total =
    3 +
    enabled.reduce((n, s) => {
      if (s.key === 'elementsGraphiques') return n + Math.ceil(imagesCount / 6);
      return n + s.pages;
    }, 0);

  return (
    <>
      <StepIntro title="Pages du document">
        Choisissez les chapitres à inclure. La couverture, le sommaire et la quatrième de couverture sont toujours présents.
      </StepIntro>
      <p className="step-counter">
        Votre charte fera environ <strong>{total} pages</strong>.
      </p>
      <ul className="toggle-list">
        {PDF_SECTIONS.map((s) => {
          const on = sections[s.key] !== false;
          const disabledHint = s.key === 'elementsGraphiques' && imagesCount === 0;
          return (
            <li key={s.key}>
              <label className={`toggle-row ${on ? 'is-on' : ''}`}>
                <span className="toggle-text">
                  <strong>{s.label}</strong>
                  <span>{disabledHint ? 'Ajoutez des images pour afficher cette section' : s.desc}</span>
                </span>
                <input type="checkbox" className="switch" checked={on} onChange={() => setSection(s.key, !on)} />
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}
