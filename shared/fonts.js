/**
 * Catalogue des polices proposées dans l'application.
 *
 * - `standard` : polices PDF de base (toujours disponibles, sans fichier).
 * - `catalog`  : polices Google Fonts embarquées localement via les paquets @fontsource
 *                (côté serveur), servies au navigateur pour l'aperçu.
 * - `custom:*` : polices importées par l'utilisateur (data/fonts).
 */

export const STANDARD_FONTS = [
  { id: 'Helvetica', label: 'Helvetica', category: 'sans' },
  { id: 'Times-Roman', label: 'Times', category: 'serif' },
  { id: 'Courier', label: 'Courier', category: 'mono' },
];

/** Graisses que l'on cherche à charger pour chaque police du catalogue. */
export const WANTED_WEIGHTS = [300, 400, 500, 600, 700];

export const CATALOG_FONTS = [
  { id: 'Inter', label: 'Inter', pkg: 'inter', category: 'sans', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'Montserrat', label: 'Montserrat', pkg: 'montserrat', category: 'sans', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'Poppins', label: 'Poppins', pkg: 'poppins', category: 'sans', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'DM Sans', label: 'DM Sans', pkg: 'dm-sans', category: 'sans', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'Source Sans 3', label: 'Source Sans 3', pkg: 'source-sans-3', category: 'sans', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'Raleway', label: 'Raleway', pkg: 'raleway', category: 'sans', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'Space Grotesk', label: 'Space Grotesk', pkg: 'space-grotesk', category: 'sans', weights: [300, 400, 500, 600, 700], italic: false },
  { id: 'Playfair Display', label: 'Playfair Display', pkg: 'playfair-display', category: 'serif', weights: [400, 500, 600, 700], italic: true },
  { id: 'Lora', label: 'Lora', pkg: 'lora', category: 'serif', weights: [400, 500, 600, 700], italic: true },
  { id: 'Merriweather', label: 'Merriweather', pkg: 'merriweather', category: 'serif', weights: [300, 400, 500, 600, 700], italic: true },
  { id: 'Libre Baskerville', label: 'Libre Baskerville', pkg: 'libre-baskerville', category: 'serif', weights: [400, 500, 600, 700], italic: true },
  { id: 'JetBrains Mono', label: 'JetBrains Mono', pkg: 'jetbrains-mono', category: 'mono', weights: [300, 400, 500, 600, 700], italic: true },
];

export const CATEGORY_LABELS = {
  sans: 'Sans serif',
  serif: 'Serif',
  mono: 'Monospace',
  custom: 'Mes polices',
};

export const FONT_ROLES = [
  { key: 'principale', label: 'Titres', hint: 'Intertitres, accroches, couverture' },
  { key: 'secondaire', label: 'Texte courant', hint: 'Paragraphes, interfaces, légendes' },
  { key: 'tertiaire', label: 'Accent', hint: 'Chiffres, citations, détails techniques' },
];

export const DEFAULT_TYPOGRAPHIE = {
  principale: 'Montserrat',
  secondaire: 'Inter',
  tertiaire: 'JetBrains Mono',
};

const CATALOG_IDS = new Set(CATALOG_FONTS.map((f) => f.id));
const STANDARD_IDS = new Set(STANDARD_FONTS.map((f) => f.id));

export function isKnownFont(id) {
  if (!id || typeof id !== 'string') return false;
  return id.startsWith('custom:') || CATALOG_IDS.has(id) || STANDARD_IDS.has(id);
}

export function getCatalogFont(id) {
  return CATALOG_FONTS.find((f) => f.id === id) || null;
}

/** Nom lisible d'une police (catalogue, standard ou personnalisée). */
export function fontDisplayName(id) {
  if (!id) return '';
  const catalog = getCatalogFont(id);
  if (catalog) return catalog.label;
  const std = STANDARD_FONTS.find((f) => f.id === id);
  if (std) return std.label;
  if (id.startsWith('custom:')) {
    return id.replace('custom:', '').replace(/-[0-9]+$/, '').replace(/-/g, ' ');
  }
  return id;
}

/** Nom de fichier @fontsource pour une graisse donnée (sous-ensemble latin). */
export function catalogFontFile(font, weight, style = 'normal') {
  return `${font.pkg}-latin-${weight}-${style}.woff`;
}
