import { useState, useRef, useEffect } from 'react';

const BUILTIN_FONTS = [
  { id: 'Helvetica', label: 'Helvetica', regular: 'Helvetica', bold: 'Helvetica-Bold', thin: 'Helvetica-Oblique' },
  { id: 'Times-Roman', label: 'Times Roman', regular: 'Times-Roman', bold: 'Times-Bold', thin: 'Times-Italic' },
  { id: 'Courier', label: 'Courier', regular: 'Courier', bold: 'Courier-Bold', thin: 'Courier-Oblique' },
];

export function FontSelect({ value, onChange, label, placeholder = 'Rechercher une police...', customFonts = [] }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const customList = Array.isArray(customFonts) ? customFonts : [];
  const customAsFamily = customList.map((f) => ({
    id: f.id,
    label: f.label || f.id?.replace?.(/^custom:/, '').replace(/-[0-9]+$/, '').replace(/-/g, ' ') || 'Police personnalisée',
    regular: f.id,
    bold: f.id,
    thin: f.id,
  }));
  const allFonts = [...customAsFamily, ...BUILTIN_FONTS];

  const selectedFont = allFonts.find((f) => f.id === value);
  const displayValue = selectedFont?.label ?? (value?.replace?.(/^custom:/, '').replace(/-[0-9]+$/, '').replace(/-/g, ' ') ?? value ?? '');
  const searchLower = search.trim().toLowerCase();
  const filteredFonts = searchLower
    ? allFonts.filter(
        (f) =>
          f.label.toLowerCase().includes(searchLower) ||
          f.id.toLowerCase().includes(searchLower)
      )
    : allFonts;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setSearch('');
  };

  const handleSelect = (font) => {
    onChange(font.id);
    setOpen(false);
    setSearch('');
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleOptionMouseDown = (e, font) => {
    e.preventDefault();
    handleSelect(font);
  };

  return (
    <label className="font-select-label">
      {label ? <span>{label}</span> : null}
      <div className="font-select-wrap" ref={containerRef}>
        <div
          className={`font-select-trigger ${open ? 'font-select-open' : ''}`}
          onClick={(e) => {
            if (e.target.closest('.font-select-input')) return;
            setOpen((prev) => !prev);
            if (!open) setSearch('');
          }}
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
              if (!open) setOpen(true);
            }}
            onFocus={handleOpen}
            onClick={handleInputClick}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-controls="font-listbox"
          />
          <span className="font-select-arrow" aria-hidden>▼</span>
        </div>
        {open && (
          <ul
            id="font-listbox"
            className="font-select-dropdown"
            role="listbox"
          >
            {customAsFamily.length > 0 && !searchLower && (
              <li className="font-select-group-label">Polices personnalisées</li>
            )}
            {filteredFonts.length > 0 ? (
              filteredFonts.map((font) => (
                <li
                  key={font.id}
                  role="option"
                  aria-selected={value === font.id}
                  className={`font-select-option ${value === font.id ? 'font-select-option-selected' : ''}`}
                  onMouseDown={(e) => handleOptionMouseDown(e, font)}
                  style={font.regular?.startsWith('custom:') ? undefined : { fontFamily: font.regular }}
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

export { BUILTIN_FONTS };
