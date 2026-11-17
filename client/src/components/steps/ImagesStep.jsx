import { useRef, useState } from 'react';
import { StepIntro } from '../ui/Field';
import { Icon } from '../ui/Icon';
import { inputFileUrl } from '../../services/api';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml';

function prettyName(name) {
  return name.replace(/\.[^.]+$/, '').replace(/-\d{10,}(-\d+)?$/, '').replace(/[-_]+/g, ' ');
}

export function ImagesStep({ images, onUpload, onDelete }) {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const send = async (files) => {
    const list = [...(files || [])].filter((f) => f.type.startsWith('image/'));
    if (!list.length || busy) return;
    setBusy(true);
    try {
      await onUpload(list);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <StepIntro title="Éléments graphiques">
        Motifs, pictogrammes, illustrations ou photos d’ambiance. Ils sont présentés dans une galerie à la fin du document.
      </StepIntro>
      <div
        className={`dropzone ${dragOver ? 'is-over' : ''}`}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          send(e.dataTransfer.files);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          hidden
          onChange={(e) => {
            const files = e.target.files;
            send(files).finally(() => {
              e.target.value = '';
            });
          }}
        />
        <Icon name="image" size={28} />
        <strong>{busy ? 'Envoi en cours…' : 'Glissez vos images ici'}</strong>
        <span>ou cliquez pour parcourir · PNG, JPEG, WebP, SVG · 15 Mo max.</span>
      </div>

      {images.length > 0 ? (
        <ul className="thumb-grid">
          {images.map((f) => (
            <li key={f.name} className="thumb">
              <img src={inputFileUrl(f)} alt="" loading="lazy" />
              <span className="thumb-name" title={f.name}>{prettyName(f.name)}</span>
              <button type="button" className="thumb-remove" onClick={() => onDelete(f.name)} aria-label={`Retirer ${prettyName(f.name)}`}>
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">Aucune image pour l’instant. Cette section est facultative : sans image, elle n’apparaît pas dans le PDF.</p>
      )}
    </>
  );
}
