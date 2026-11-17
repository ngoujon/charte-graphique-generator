import { useId } from 'react';

/** Champ de formulaire : libellé, aide facultative et contrôle (input ou textarea). */
export function Field({ label, hint, value, onChange, placeholder, multiline = false, rows = 3, type = 'text', maxLength, optional }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const Control = multiline ? 'textarea' : 'input';
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="field-optional">facultatif</span>}
      </label>
      <Control
        id={id}
        className="field-control"
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        value={value ?? ''}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-describedby={hintId}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}

export function StepIntro({ title, children }) {
  return (
    <div className="step-intro">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </div>
  );
}
