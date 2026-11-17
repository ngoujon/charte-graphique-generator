import { useState, useRef } from 'react';
import { inputFileUrl } from '../../services/api';
import { readableOn } from '@shared/colors.js';
import { parseColorInput } from '@shared/parseColorInput.js';
import { Icon } from '../ui/Icon';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml';

export function LogoDropZone({ type, label, hint, bgColor, logo, onUpload, onDelete }) {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const bg = parseColorInput(bgColor) || '#ffffff';
  const fg = readableOn(bg);

  const send = async (file) => {
    if (!file || busy) return;
    setBusy(true);
    try {
      await onUpload(type, file);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="logo-card">
      <div
        className={`logo-drop ${dragOver ? 'is-over' : ''} ${logo ? 'has-logo' : ''}`}
        style={{ backgroundColor: bg, color: fg }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          send(e.dataTransfer?.files?.[0]);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${label} : ${logo ? 'remplacer le fichier' : 'ajouter un fichier'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            send(file);
          }}
        />
        {busy ? (
          <span className="logo-drop-text">Envoi…</span>
        ) : logo ? (
          <img src={inputFileUrl(logo)} alt={label} className="logo-drop-img" />
        ) : (
          <span className="logo-drop-text">
            <Icon name="upload" size={20} />
            {dragOver ? 'Déposez le fichier' : 'Glisser ou cliquer'}
          </span>
        )}
      </div>
      <div className="logo-card-meta">
        <div>
          <strong>{label}</strong>
          <span>{hint}</span>
        </div>
        {logo && (
          <button type="button" className="icon-btn icon-btn-sm" onClick={() => onDelete(logo.name)} aria-label={`Retirer : ${label}`}>
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
