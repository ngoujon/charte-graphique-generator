import { Icon } from './ui/Icon';

const STATUS = {
  idle: 'Préparation…',
  pending: 'Modifications en attente…',
  loading: 'Mise à jour de l’aperçu…',
  ready: 'Aperçu à jour',
  error: 'Aperçu indisponible',
};

/** Aperçu en direct du PDF, positionné sur la page correspondant à l'étape en cours. */
export function PreviewPanel({ preview, page, onGenerate, generating, onOpenFiles, filesCount }) {
  const { url, status, error, refresh } = preview;
  const src = url ? `${url}#page=${page || 1}&view=FitH&navpanes=0` : null;

  return (
    <section className="preview" aria-label="Aperçu du document">
      <div className="preview-toolbar">
        <div className={`preview-status preview-status-${status}`} aria-live="polite">
          <span className="dot" aria-hidden="true" />
          {STATUS[status]}
        </div>
        <div className="preview-actions">
          <button type="button" className="btn btn-ghost" onClick={refresh} title="Actualiser l’aperçu">
            <Icon name="refresh" size={16} />
            <span className="hide-sm">Actualiser</span>
          </button>
          <button type="button" className="btn btn-ghost" onClick={onOpenFiles}>
            <Icon name="folder" size={16} />
            <span className="hide-sm">Mes PDF</span>
            {filesCount > 0 && <span className="count">{filesCount}</span>}
          </button>
          <button type="button" className="btn btn-primary" onClick={onGenerate} disabled={generating}>
            <Icon name="download" size={16} />
            {generating ? 'Génération…' : 'Télécharger le PDF'}
          </button>
        </div>
      </div>
      <div className="preview-frame">
        {src ? (
          <iframe key={src} src={src} title="Aperçu du PDF" />
        ) : (
          <div className="preview-placeholder">
            {status === 'error' ? (
              <>
                <Icon name="alert" size={28} />
                <p>{error}</p>
                <button type="button" className="btn btn-secondary" onClick={refresh}>Réessayer</button>
              </>
            ) : (
              <>
                <div className="spinner" aria-hidden="true" />
                <p>Création de l’aperçu…</p>
              </>
            )}
          </div>
        )}
        {src && status === 'loading' && <div className="preview-loading-bar" aria-hidden="true" />}
        {src && status === 'error' && <div className="preview-error">{error}</div>}
      </div>
    </section>
  );
}
