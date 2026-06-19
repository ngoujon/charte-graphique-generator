import { useState, useRef } from 'react';
import { API } from '../../services/api';

export function LogoDropZone({ type, label, bgColor, isDark, logo, onUpload, onDelete, uploading: externalUploading }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isLoading = uploading || externalUploading;

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file?.type?.startsWith('image/') && !isLoading) {
      setUploading(true);
      await onUpload(type, file);
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !isLoading) {
      setUploading(true);
      await onUpload(type, file);
      setUploading(false);
    }
  };

  return (
    <div
      className={`logo-drop-zone ${dragOver ? 'logo-drop-zone-active' : ''} ${isDark ? 'logo-drop-zone-dark' : ''} ${isLoading ? 'logo-drop-zone-loading' : ''}`}
      style={{ backgroundColor: bgColor }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => !isLoading && fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${label}. Glissez ou cliquez pour ajouter`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="logo-drop-input"
        tabIndex={-1}
      />
      {isLoading ? (
        <span className="logo-drop-placeholder">Chargement…</span>
      ) : logo ? (
        <>
          <img
            key={logo.name}
            src={`${API}/input/files/${encodeURIComponent(logo.name)}?t=${logo.modified || Date.now()}`}
            alt={label}
            className="logo-preview"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="logo-remove-btn"
            onClick={(e) => { e.stopPropagation(); onDelete(logo.name); }}
            aria-label={`Supprimer ${label}`}
          >
            ✕
          </button>
        </>
      ) : (
        <span className="logo-drop-placeholder">
          {dragOver ? 'Déposez ici' : 'Glissez ou cliquez'}
        </span>
      )}
      <span className="logo-drop-label">{label}</span>
    </div>
  );
}
