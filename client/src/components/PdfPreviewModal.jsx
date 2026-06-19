import { Modal } from './ui/Modal';

export function PdfPreviewModal({ isOpen, url, filename, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title={filename ? `Aperçu — ${filename}` : 'Aperçu PDF'}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Fermer
          </button>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Ouvrir dans un nouvel onglet
            </a>
          )}
        </>
      }
    >
      {url && (
        <iframe
          src={url}
          title={filename || 'Aperçu PDF'}
          className="pdf-preview-iframe"
        />
      )}
    </Modal>
  );
}
