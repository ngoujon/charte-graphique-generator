import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';

/** Menu déroulant simple (bouton + liste d'actions), fermé par Échap ou clic extérieur. */
export function Menu({ label, icon = 'more', items }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    rootRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={rootRef}>
      <button
        type="button"
        className="btn btn-ghost"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={icon} />
        <span className="hide-sm">{label}</span>
      </button>
      {open && (
        <div className="menu-list" role="menu">
          {items.filter(Boolean).map((item, i) =>
            item === '-' ? (
              <div key={`sep-${i}`} className="menu-sep" role="separator" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`menu-item ${item.danger ? 'menu-item-danger' : ''}`}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span>
                  {item.label}
                  {item.hint && <small>{item.hint}</small>}
                </span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
