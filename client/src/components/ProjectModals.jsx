import { useState } from 'react';
import { Modal } from './ui/Modal';
import { formatDate } from '../services/api';

export function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState('blank');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      await onCreate({ nom: name.trim(), blank: mode === 'blank' });
      setName('');
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle charte"
      description="Chaque charte est enregistrée séparément. Vous pourrez passer de l’une à l’autre à tout moment."
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button type="button" className="btn btn-primary" onClick={submit} disabled={!name.trim() || busy}>
            Créer la charte
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="stack">
        <div className="field">
          <label className="field-label" htmlFor="new-project-name">Nom de la marque</label>
          <input
            id="new-project-name"
            data-autofocus
            className="field-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex. Boulangerie Martin"
            maxLength={60}
          />
        </div>
        <fieldset className="choice-group">
          <legend className="field-label">Point de départ</legend>
          <label className={`choice ${mode === 'blank' ? 'is-on' : ''}`}>
            <input type="radio" name="mode" checked={mode === 'blank'} onChange={() => setMode('blank')} />
            <span>
              <strong>Charte vierge</strong>
              <small>Réglages par défaut</small>
            </span>
          </label>
          <label className={`choice ${mode === 'copy' ? 'is-on' : ''}`}>
            <input type="radio" name="mode" checked={mode === 'copy'} onChange={() => setMode('copy')} />
            <span>
              <strong>Copie de la charte actuelle</strong>
              <small>Mêmes couleurs, polices, textes et logos</small>
            </span>
          </label>
        </fieldset>
        <p className="field-hint">Chaque charte garde ses propres logos et images. Une copie reprend ceux de la charte actuelle.</p>
      </form>
    </Modal>
  );
}

export function HistoryModal({ isOpen, onClose, history, onRestore }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Versions précédentes"
      description="Une version est enregistrée automatiquement toutes les deux minutes pendant que vous travaillez."
    >
      {history?.length ? (
        <ul className="file-list">
          {history.map((h) => (
            <li key={h.id}>
              <div className="file-main">
                <span className="file-name">{h.projetNom || 'Sans nom'}</span>
                <span className="file-meta">{formatDate(h.modified)}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={async () => {
                  await onRestore(h.id);
                  onClose();
                }}
              >
                Restaurer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">Aucune version enregistrée pour l’instant.</p>
      )}
    </Modal>
  );
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, children, confirmLabel = 'Confirmer' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onClose();
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
