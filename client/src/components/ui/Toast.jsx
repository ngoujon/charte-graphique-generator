import { Icon } from './Icon';

export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${message.type}`} role={message.type === 'error' ? 'alert' : 'status'} aria-live="polite">
      <Icon name={message.type === 'error' ? 'alert' : 'check'} size={16} />
      <span className="toast-text">{message.text}</span>
      {message.action && (
        <button type="button" className="toast-action" onClick={message.action.onClick}>
          {message.action.label}
        </button>
      )}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Fermer la notification">
        <Icon name="close" size={14} />
      </button>
    </div>
  );
}
