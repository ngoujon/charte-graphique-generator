import { Field, StepIntro } from '../ui/Field';

function splitList(value) {
  return String(value || '')
    .split(/[,;\n•·]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function BrandStep({ config, update }) {
  const m = config.marque || {};
  const set = (field) => (v) => update('marque', field, v);
  const valeurs = splitList(m.valeurs);
  const traits = splitList(m.personnalite);
  return (
    <>
      <StepIntro title="L’identité de la marque">
        Ce que la marque défend et sa façon de parler. Laissez vide ce que vous ne souhaitez pas afficher.
      </StepIntro>
      <Field label="Signature (slogan)" value={m.slogan} onChange={set('slogan')} placeholder="Ex. Le cloud, simplement." maxLength={90} />
      <Field
        label="Mission"
        value={m.mission}
        onChange={set('mission')}
        placeholder="Ex. Rendre le cloud simple et accessible aux petites entreprises."
        multiline
        rows={3}
      />
      <Field
        label="Valeurs"
        value={m.valeurs}
        onChange={set('valeurs')}
        placeholder="Ex. Clarté, Fiabilité, Bienveillance"
        hint={valeurs.length ? `${valeurs.length} valeur${valeurs.length > 1 ? 's' : ''} : séparez-les par des virgules (6 au maximum).` : 'Séparez-les par des virgules (6 au maximum).'}
      />
      {valeurs.length > 0 && (
        <div className="chip-preview" aria-hidden="true">
          {valeurs.slice(0, 6).map((v) => (
            <span key={v} className="chip">{v}</span>
          ))}
        </div>
      )}
      <Field
        label="Personnalité"
        value={m.personnalite}
        onChange={set('personnalite')}
        placeholder="Ex. Accessible, précise, optimiste"
        hint="Quelques adjectifs séparés par des virgules."
      />
      {traits.length > 0 && (
        <div className="chip-preview" aria-hidden="true">
          {traits.slice(0, 8).map((v) => (
            <span key={v} className="chip chip-outline">{v}</span>
          ))}
        </div>
      )}
      <Field
        label="Démarche créative"
        value={m.recherche}
        onChange={set('recherche')}
        placeholder="Ex. Nous nous sommes inspirés du ciel et des nuages…"
        multiline
        rows={4}
        optional
        hint="Racontez les inspirations et les choix qui ont guidé l’identité."
      />
    </>
  );
}
