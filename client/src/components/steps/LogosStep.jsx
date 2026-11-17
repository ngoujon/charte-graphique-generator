import { StepIntro } from '../ui/Field';
import { LogoDropZone } from '../logos/LogoDropZone';

const VARIANTS = [
  { type: 'clair', label: 'Version principale', hint: 'Sur fond clair', color: 'clair' },
  { type: 'sombre', label: 'Version négative', hint: 'Sur fond sombre', color: 'sombre' },
  { type: 'primaire', label: 'Sur couleur principale', hint: 'Facultatif', color: 'primaire' },
  { type: 'secondaire', label: 'Sur couleur secondaire', hint: 'Facultatif', color: 'secondaire' },
];

export function LogosStep({ config, logos, onUpload, onDelete }) {
  const count = VARIANTS.filter((v) => logos[v.type]).length;
  return (
    <>
      <StepIntro title="Le logo">
        Déposez une version du logo pour chaque fond. PNG transparent ou SVG recommandés. Sans fichier, le nom de la marque est utilisé.
      </StepIntro>
      <p className="step-counter">
        <strong>{count}/4</strong> version{count > 1 ? 's' : ''} ajoutée{count > 1 ? 's' : ''}
      </p>
      <div className="logo-grid">
        {VARIANTS.map((v) => (
          <LogoDropZone
            key={v.type}
            type={v.type}
            label={v.label}
            hint={v.hint}
            bgColor={config.couleurs?.[v.color]}
            logo={logos[v.type]}
            onUpload={onUpload}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  );
}
