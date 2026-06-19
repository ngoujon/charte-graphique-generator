export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      className={`toast toast-${message.type}`}
      role="status"
      aria-live="polite"
    >
      {message.text}
    </div>
  );
}
