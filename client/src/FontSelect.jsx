import { useState, useRef, useEffect } from 'react';

const FONT_FAMILIES = [
  { id: 'Helvetica', label: 'Helvetica', regular: 'Helvetica', bold: 'Helvetica-Bold', thin: 'Helvetica-Oblique' },
  { id: 'Times-Roman', label: 'Times Roman', regular: 'Times-Roman', bold: 'Times-Bold', thin: 'Times-Italic' },
  { id: 'Courier', label: 'Courier', regular: 'Courier', bold: 'Courier-Bold', thin: 'Courier-Oblique' },
];

export function FontSelect({ value, onChange, label, placeholder = 'Rechercher une police...' }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedFont = FONT_FAMILIES.find((f) => f.id === value);
  const displayValue = selectedFont?.label ?? (value || '');
  const filteredFonts = search.trim()
    ? FONT_FAMILIES.filter(
        (f) =>
          f.label.toLowerCase().includes(search.toLowerCase()) ||
          f.id.toLowerCase().includes(search.toLowerCase())
      )
    : FONT_FAMILIES;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setSearch(displayValue);
  }, [open, displayValue]);

  const handleSelect = (font) => {
    onChange(font.id);
    setSearch('');
    setOpen(false);
  };

  return (
    <label className="font-select-label">
      {label ? <span>{label}</span> : null}
      <div className="font-select-wrap" ref={containerRef}>
        <div
          className={`font-select-trigger ${open ? 'font-select-open' : ''}`}
          onClick={() => setOpen(!open)}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <input
            type="text"
            className="font-select-input"
            value={open ? search : displayValue}
            onChange={(e) => {
              setSearch(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-controls="font-listbox"
          />
          <span className="font-select-arrow">▼</span>
        </div>
        {open && (
          <ul
            id="font-listbox"
            className="font-select-dropdown"
            role="listbox"
          >
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <li
                  key={font.id}
                  role="option"
                  aria-selected={value === font.id}
                  className={`font-select-option ${value === font.id ? 'font-select-option-selected' : ''}`}
                  onClick={() => handleSelect(font)}
                  style={{ fontFamily: font.regular }}
                >
                  {font.label}
                </li>
              ))
            ) : (
              <li className="font-select-option font-select-option-empty">
                Aucune police trouvée
              </li>
            )}
          </ul>
        )}
      </div>
    </label>
  );
}

export { FONT_FAMILIES };
