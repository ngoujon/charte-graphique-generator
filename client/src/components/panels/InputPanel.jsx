import { useState } from 'react';
import { apiFetch, formatSize, filterGeneralInputFiles } from '../../services/api';

const TrashIcon = () => (
  <svg className="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function InputPanel({ inputFiles, refetchInput, onMessage }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const generalFiles = filterGeneralInputFiles(inputFiles);

  const uploadFilesList = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const form = new FormData();
    for (const f of files) form.append('files', f);
    try {
      await apiFetch('/input/upload', { method: 'POST', body: form });
      await refetchInput();
      onMessage({ type: 'success', text: `${files.length} fichier(s) ajouté(s)` });
    } catch (err) {
      onMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const uploadFiles = async (e) => {
    await uploadFilesList([...e.target.files]);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = [...e.dataTransfer.files].filter((f) => f.type.startsWith('image/'));
    if (files.length) await uploadFilesList(files);
  };

  const deleteInputFile = async (name) => {
    try {
      await apiFetch(`/input/files/${encodeURIComponent(name)}`, { method: 'DELETE' });
      await refetchInput();
    } catch (e) {
      onMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <section className="panel">
      <h2>Dossier Entrée</h2>
      <p className="hint">
        Autres images pour la charte (éléments graphiques, etc.) — les logos sont gérés dans la configuration.
      </p>
      <div
        className={`upload-zone ${dragOver ? 'upload-zone-active' : ''} ${uploading ? 'upload-zone-loading' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <label>
          <input type="file" multiple accept="image/*" onChange={uploadFiles} hidden disabled={uploading} />
          <span>{uploading ? 'Upload en cours…' : 'Cliquez pour parcourir'}</span>
          {!uploading && ' ou glissez-déposez vos images'}
        </label>
      </div>
      <label className="btn btn-primary">
        <input type="file" multiple accept="image/*" onChange={uploadFiles} hidden disabled={uploading} />
        Ajouter des fichiers
      </label>
      <ul className="file-list">
        {generalFiles.map((f) => (
          <li key={f.name}>
            <span>{f.name}</span>
            <span className="size">{formatSize(f.size)}</span>
            <button
              type="button"
              className="btn-icon"
              onClick={() => deleteInputFile(f.name)}
              aria-label={`Supprimer ${f.name}`}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
      {generalFiles.length === 0 && (
        <p className="empty">Aucun fichier. Ajoutez des images pour la charte.</p>
      )}
    </section>
  );
}
