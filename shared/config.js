import { z } from 'zod';
import { DEFAULT_TYPOGRAPHIE, isKnownFont } from './fonts.js';

export const DEFAULT_CONF = {
  version: 1,
  projet: {
    nom: 'Ma marque',
    description: '',
    auteur: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  },
  marque: {
    slogan: '',
    mission: '',
    valeurs: '',
    personnalite: '',
    recherche: '',
  },
  couleurs: {
    clair: '#ffffff',
    sombre: '#1a1a1a',
    primaire: '#2563eb',
    secondaire: '#64748b',
  },
  typographie: { ...DEFAULT_TYPOGRAPHIE },
  sections: {
    marque: true,
    logo: true,
    couleurs: true,
    typographie: true,
    kitUi: true,
    elementsGraphiques: true,
    aboutQwebty: true,
  },
  logo: null,
};

const sectionsSchema = z.object({
  marque: z.boolean().optional(),
  logo: z.boolean().optional(),
  couleurs: z.boolean().optional(),
  typographie: z.boolean().optional(),
  kitUi: z.boolean().optional(),
  elementsGraphiques: z.boolean().optional(),
  aboutQwebty: z.boolean().optional(),
});

export const charteConfigSchema = z.object({
  version: z.number().optional(),
  projet: z.object({
    nom: z.string().optional(),
    description: z.string().optional(),
    auteur: z.string().optional(),
    reference: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
  marque: z.object({
    slogan: z.string().optional(),
    mission: z.string().optional(),
    valeurs: z.string().optional(),
    personnalite: z.string().optional(),
    recherche: z.string().optional(),
  }).optional(),
  couleurs: z.record(z.string()).optional(),
  typographie: z.record(z.string()).optional(),
  sections: sectionsSchema.optional(),
  logo: z.unknown().nullable().optional(),
});

export function normalizeCouleurs(couleurs) {
  if (!couleurs || typeof couleurs !== 'object') return { ...DEFAULT_CONF.couleurs };
  return {
    clair: couleurs.clair ?? couleurs.fond ?? couleurs.blanc ?? DEFAULT_CONF.couleurs.clair,
    sombre: couleurs.sombre ?? couleurs.texte ?? couleurs.noir ?? DEFAULT_CONF.couleurs.sombre,
    primaire: couleurs.primaire ?? DEFAULT_CONF.couleurs.primaire,
    secondaire: couleurs.secondaire ?? DEFAULT_CONF.couleurs.secondaire,
  };
}

export function normalizeTypographie(typo) {
  if (!typo || typeof typo !== 'object') return { ...DEFAULT_CONF.typographie };
  const toKnownFont = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    if (isKnownFont(s)) return s;
    const base = s.replace(/-Bold|-Oblique|-Italic|-BoldOblique|-BoldItalic/g, '');
    return isKnownFont(base) ? base : null;
  };
  const getFont = (v, fallback) => toKnownFont(v) ?? fallback;
  return {
    principale: getFont(typo.principale ?? typo.titre, DEFAULT_TYPOGRAPHIE.principale),
    secondaire: getFont(typo.secondaire ?? typo.corps, DEFAULT_TYPOGRAPHIE.secondaire),
    tertiaire: getFont(typo.tertiaire, DEFAULT_TYPOGRAPHIE.tertiaire),
  };
}

export function normalizeSections(sections) {
  return { ...DEFAULT_CONF.sections, ...(sections && typeof sections === 'object' ? sections : {}) };
}

export function normalizeConfig(raw) {
  const parsed = charteConfigSchema.safeParse(raw);
  const base = parsed.success ? parsed.data : {};
  return {
    ...DEFAULT_CONF,
    ...base,
    version: 1,
    projet: { ...DEFAULT_CONF.projet, ...base.projet },
    marque: { ...DEFAULT_CONF.marque, ...base.marque },
    couleurs: normalizeCouleurs(base.couleurs),
    typographie: normalizeTypographie(base.typographie),
    sections: normalizeSections(base.sections),
  };
}

export function validateConfig(raw) {
  const result = charteConfigSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: result.error.flatten() };
  }
  return { ok: true, config: normalizeConfig(result.data) };
}

/**
 * Styles de départ : n'appliquent que les couleurs et les polices,
 * sans toucher aux textes saisis par l'utilisateur.
 */
export const CHARTE_TEMPLATES = {
  startup: {
    label: 'Tech & startup',
    description: 'Moderne, net, énergique',
    couleurs: { clair: '#ffffff', sombre: '#0f172a', primaire: '#6d28d9', secondaire: '#06b6d4' },
    typographie: { principale: 'Space Grotesk', secondaire: 'Inter', tertiaire: 'JetBrains Mono' },
  },
  institution: {
    label: 'Institution',
    description: 'Sérieux, sobre, fiable',
    couleurs: { clair: '#ffffff', sombre: '#1e293b', primaire: '#1e40af', secondaire: '#b45309' },
    typographie: { principale: 'Merriweather', secondaire: 'Source Sans 3', tertiaire: 'Source Sans 3' },
  },
  retail: {
    label: 'Commerce',
    description: 'Chaleureux, accueillant',
    couleurs: { clair: '#fffbf5', sombre: '#292524', primaire: '#dc2626', secondaire: '#f59e0b' },
    typographie: { principale: 'Poppins', secondaire: 'DM Sans', tertiaire: 'Poppins' },
  },
  premium: {
    label: 'Premium',
    description: 'Élégant, raffiné',
    couleurs: { clair: '#faf8f5', sombre: '#141414', primaire: '#1c1c1c', secondaire: '#b08d57' },
    typographie: { principale: 'Playfair Display', secondaire: 'Raleway', tertiaire: 'Libre Baskerville' },
  },
  nature: {
    label: 'Nature & bien-être',
    description: 'Doux, organique, apaisant',
    couleurs: { clair: '#f7f7f2', sombre: '#1f2a24', primaire: '#3f6e4f', secondaire: '#d4a373' },
    typographie: { principale: 'Lora', secondaire: 'DM Sans', tertiaire: 'Lora' },
  },
};
