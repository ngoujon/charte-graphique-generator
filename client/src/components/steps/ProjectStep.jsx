import { Field, StepIntro } from '../ui/Field';

export function ProjectStep({ config, update }) {
  const p = config.projet || {};
  const set = (field) => (v) => update('projet', field, v);
  return (
    <>
      <StepIntro title="Le projet">
        Ces informations apparaissent sur la couverture et dans le sommaire du document.
      </StepIntro>
      <Field label="Nom de la marque" value={p.nom} onChange={set('nom')} placeholder="Ex. Nimbus Labs" maxLength={60} />
      <Field
        label="Présentation courte"
        value={p.description}
        onChange={set('description')}
        placeholder="Ex. Identité visuelle de la plateforme Nimbus."
        multiline
        rows={2}
        optional
        hint="Une ou deux phrases affichées dans le sommaire."
      />
      <div className="field-row">
        <Field label="Préparé par" value={p.auteur} onChange={set('auteur')} placeholder="Ex. Studio Qwebty" optional />
        <Field label="Date" type="date" value={p.date} onChange={set('date')} />
      </div>
      <Field
        label="Référence du document"
        value={p.reference}
        onChange={set('reference')}
        placeholder="Ex. CHG-2026-014"
        optional
        hint="Utile pour retrouver une version précise de la charte."
      />
    </>
  );
}
