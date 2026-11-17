import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Icon } from './ui/Icon';
import { API, apiFetch, formatSize, formatDate, downloadUrl } from '../services/api';

/** Liste des PDF générés et de la corbeille. */
export function FilesModal({ isOpen, onClose, outputFiles, trashFiles, refetch, onMessage }) {
  const [tab, setTab] = useState('output');
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const files = (tab === 'output' ? outputFiles : trashFiles) || [];
  const base = tab === 'output' ? '/output/files' : '/output/trash/files';

  const run = async (fn, success) => {
    try {
      await fn();
      await refetch();
      if (success) onMessage({ type: 'success', text: success });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const url = (name) => `${API}${base}/${encodeURIComponent(name)}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmEmpty(false);
        onClose();
      }}
      title="Mes PDF"
      description="Les chartes générées sont conservées ici. Les fichiers supprimés passent par la corbeille."
      size="lg"
    >
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'output'} className={tab === 'output' ? 'is-active' : ''} onClick={() => setTab('output')}>
          Documents <span className="count">{outputFiles?.length || 0}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'trash'} className={tab === 'trash' ? 'is-active' : ''} onClick={() => setTab('trash')}>
          Corbeille <span className="count">{trashFiles?.length || 0}</span>
        </button>
      </div>

      {files.length === 0 ? (
        <p className="empty-state">
          {tab === 'output' ? 'Aucun PDF pour l’instant. Cliquez sur « Télécharger le PDF » pour en créer un.' : 'La corbeille est vide.'}
        </p>
      ) : (
        <ul className="file-list">
          {files.map((f) => (
            <li key={f.name}>
              <Icon name="file" size={20} className="file-icon" />
              <div className="file-main">
                <span className="file-name" title={f.name}>{f.name}</span>
                <span className="file-meta">
                  {formatDate(f.modified)} · {formatSize(f.size)}
                </span>
              </div>
              <div className="file-actions">
                <a className="icon-btn" href={url(f.name)} target="_blank" rel="noreferrer" title="Ouvrir" aria-label={`Ouvrir ${f.name}`}>
                  <Icon name="external" size={16} />
                </a>
                {tab === 'output' ? (
                  <>
                    <button type="button" className="icon-btn" onClick={() => downloadUrl(url(f.name), f.name)} title="Télécharger" aria-label={`Télécharger ${f.name}`}>
                      <Icon name="download" size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => run(() => apiFetch(`${base}/${encodeURIComponent(f.name)}`, { method: 'DELETE' }), 'PDF déplacé dans la corbeille')}
                      title="Mettre à la corbeille"
                      aria-label={`Mettre ${f.name} à la corbeille`}
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => run(() => apiFetch(`${base}/${encodeURIComponent(f.name)}/restore`, { method: 'POST' }), 'PDF restauré')}
                      title="Restaurer"
                      aria-label={`Restaurer ${f.name}`}
                    >
                      <Icon name="restore" size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-btn icon-btn-danger"
                      onClick={() => run(() => apiFetch(`${base}/${encodeURIComponent(f.name)}`, { method: 'DELETE' }), 'PDF supprimé définitivement')}
                      title="Supprimer définitivement"
                      aria-label={`Supprimer définitivement ${f.name}`}
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === 'output' && files.length > 1 && (
        <div className="modal-inline-actions">
          {confirmEmpty ? (
            <>
              <span>Déplacer les {files.length} PDF dans la corbeille ?</span>
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmEmpty(false)}>Annuler</button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  setConfirmEmpty(false);
                  run(() => apiFetch('/output/files', { method: 'DELETE' }), 'Tous les PDF ont été déplacés dans la corbeille');
                }}
              >
                Confirmer
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmEmpty(true)}>
              <Icon name="trash" size={16} />
              Tout mettre à la corbeille
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
