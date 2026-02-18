const BUILTIN_FONTS = [
  { id: 'Helvetica', label: 'Helvetica' },
  { id: 'Times-Roman', label: 'Times Roman' },
  { id: 'Courier', label: 'Courier' },
];

export function FontSelect({ value, onChange, customFonts = [] }) {
  const customList = Array.isArray(customFonts) ? customFonts : [];
  const customOptions = customList.map((f) => ({
    id: f.id,
    label: f.label || f.id?.replace?.(/^custom:/, '').replace(/-[0-9]+$/, '').replace(/-/g, ' ') || 'Police personnalisée',
  }));
  const allFonts = [...customOptions, ...BUILTIN_FONTS];

  const safeValue = value && allFonts.some((f) => f.id === value) ? value : 'Helvetica';
  return (
    <select
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {allFonts.map((font) => (
        <option key={font.id} value={font.id}>
          {font.label}
        </option>
      ))}
    </select>
  );
}

export { BUILTIN_FONTS };
