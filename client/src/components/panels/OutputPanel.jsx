import { useState } from 'react';
import { API, apiFetch, formatSize } from '../../services/api';
import { Modal } from '../ui/Modal';
import { PdfPreviewModal } from '../PdfPreviewModal';
import { useModalKeyboard } from '../../hooks/useModalKeyboard';

const PreviewIcon = () => (
  <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PdfIcon = () => (
  <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export function OutputPanel({
  outputFiles,
  trashFiles,
  refetchOutput,
  refetchTrash,
  onMessage,
}) {
  const [showTrash, setShowTrash] = useState(false);
  const [showAllOutput, setShowAllOutput] = useState(false);
  const [showAllTrash, setShowAllTrash] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);
  const [preview, setPreview] = useState(null);

  const deleteAllOutputFiles = async () => {
    setShowConfirmDeleteAll(false);
    try {
      await apiFetch('/output/files', { method: 'DELETE' });
      refetchOutput();
      refetchTrash();
      onMessage({ type: 'success', text: 'Tous les PDFs ont été déplacés dans la corbeille' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  useModalKeyboard(showConfirmDeleteAll, {
    onClose: () => setShowConfirmDeleteAll(false),
    onConfirm: deleteAllOutputFiles,
  });

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const json = await apiFetch('/generate', { method: 'POST' });
      refetchOutput();
      onMessage({ type: 'success', text: `PDF généré : ${json.filename}` });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    } finally {
      setGenerating(false);
    }
  };

  const deleteOutputFile = async (name) => {
    try {
      await apiFetch(`/output/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
      refetchOutput();
      refetchTrash();
      onMessage({ type: 'success', text: 'PDF déplacé dans la corbeille' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const restoreTrashFile = async (name) => {
    try {
      await apiFetch(`/output/trash/files/${encodeURIComponent(name)}/restore`, { method: 'POST' });
      refetchOutput();
      refetchTrash();
      onMessage({ type: 'success', text: 'PDF restauré' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const permanentlyDeleteTrashFile = async (name) => {
    try {
      await apiFetch(`/output/trash/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
      refetchTrash();
      onMessage({ type: 'success', text: 'PDF supprimé définitivement' });
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  const openPreview = (name, isTrash) => {
    const base = isTrash ? '/output/trash/files' : '/output/files';
    setPreview({ url: `${API}${base}/${encodeURIComponent(name)}`, filename: name });
  };

  const files = showTrash ? trashFiles : outputFiles;
  const showAll = showTrash ? showAllTrash : showAllOutput;
  const setShowAll = showTrash ? setShowAllTrash : setShowAllOutput;
  const visibleFiles = (files || []).slice(0, showAll ? undefined : 3);

  const renderFileRow = (f, isTrash) => (
    <li key={f.name}>
      <button
        type="button"
        className="btn-icon btn-icon-preview"
        onClick={() => openPreview(f.name, isTrash)}
        aria-label={`Aperçu de ${f.name}`}
      >
        <PreviewIcon />
      </button>
      <span className="file-name">{f.name}</span>
      <span className="size">{formatSize(f.size)}</span>
      {isTrash ? (
        <>
          <button
            type="button"
            className="btn-icon btn-icon-restore"
            onClick={() => restoreTrashFile(f.name)}
            aria-label={`Restaurer ${f.name}`}
          >
            ↩
          </button>
          <button
            type="button"
            className="btn-icon"
            onClick={() => permanentlyDeleteTrashFile(f.name)}
            aria-label={`Supprimer définitivement ${f.name}`}
          >
            <TrashIcon />
          </button>
        </>
      ) : (
        <button
          type="button"
          className="btn-icon"
          onClick={() => deleteOutputFile(f.name)}
          aria-label={`Supprimer ${f.name}`}
        >
          <TrashIcon />
        </button>
      )}
    </li>
  );

  return (
    <>
      <section className="panel">
        <h2>Dossier Sortie</h2>
        <p className="hint">
          {showTrash ? 'PDFs supprimés. Restaurez ou supprimez définitivement.' : 'PDFs générés à partir de l\'entrée et de la configuration.'}
        </p>
        <div className="output-actions">
          {!showTrash && (
            <button
              type="button"
              className="btn btn-primary btn-large"
              onClick={generatePdf}
              disabled={generating}
              title="Générer le PDF"
            >
              <PdfIcon />
              {generating ? 'Génération…' : 'Générer le PDF'}
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-icon-only"
            onClick={() => (showTrash ? refetchTrash() : refetchOutput())}
            aria-label="Rafraîchir la liste"
          >
            <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button
            type="button"
            className={`btn btn-secondary btn-icon-only switch-output-trash ${showTrash ? 'btn-active' : ''}`}
            onClick={() => setShowTrash((v) => !v)}
            aria-label={showTrash ? 'Afficher le dossier sortie' : 'Afficher la corbeille'}
          >
            <TrashIcon />
          </button>
          {!showTrash && (outputFiles?.length ?? 0) > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-delete-all"
              onClick={() => setShowConfirmDeleteAll(true)}
            >
              Supprimer tout
            </button>
          )}
        </div>
        <ul className="file-list file-list-output">
          {visibleFiles.map((f) => renderFileRow(f, showTrash))}
        </ul>
        {(files?.length ?? 0) > 3 && (
          <button
            type="button"
            className="btn btn-secondary btn-show-more"
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Voir moins' : `Voir plus (${files.length - 3} autre${files.length - 3 > 1 ? 's' : ''})`}
          </button>
        )}
        {!showTrash && (!outputFiles || outputFiles.length === 0) && (
          <p className="empty">Aucun PDF. Cliquez sur &quot;Générer le PDF&quot; pour en créer un.</p>
        )}
        {showTrash && (!trashFiles || trashFiles.length === 0) && (
          <p className="empty">Corbeille vide.</p>
        )}
      </section>

      <Modal
        isOpen={showConfirmDeleteAll}
        title="Supprimer toutes les chartes graphiques ?"
        onClose={() => setShowConfirmDeleteAll(false)}
        actions={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmDeleteAll(false)}>
              Annuler
            </button>
            <button type="button" className="btn btn-primary btn-danger" onClick={deleteAllOutputFiles}>
              Supprimer tout
            </button>
          </>
        }
      >
        <p>
          Les {outputFiles?.length ?? 0} PDF{outputFiles?.length > 1 ? 's' : ''} seront déplacé{outputFiles?.length > 1 ? 's' : ''} dans la corbeille.
        </p>
      </Modal>

      <PdfPreviewModal
        isOpen={!!preview}
        url={preview?.url}
        filename={preview?.filename}
        onClose={() => setPreview(null)}
      />
    </>
  );
}
