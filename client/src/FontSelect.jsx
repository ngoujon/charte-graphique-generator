const FONTS = [
  { id: 'Helvetica', label: 'Helvetica' },
  { id: 'Times-Roman', label: 'Times Roman' },
  { id: 'Courier', label: 'Courier' },
];

export function FontSelect({ value, onChange }) {
  const safeValue = value && FONTS.some((f) => f.id === value) ? value : 'Helvetica';
  return (
    <select
      value={safeValue}
      onChange={(e) => onChange(e.target.value)}
    >
      {FONTS.map((font) => (
        <option key={font.id} value={font.id}>
          {font.label}
        </option>
      ))}
    </select>
  );
}

