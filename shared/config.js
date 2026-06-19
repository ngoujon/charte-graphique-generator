import { z } from 'zod';

export const DEFAULT_CONF = {
  version: 1,
  projet: {
    nom: 'Mon Projet',
    description: 'Charte graphique du projet',
    auteur: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  },
  marque: {
    slogan: 'Votre slogan ici',
    mission: 'Notre mission est de...',
    valeurs: 'Innovation, Qualité, Proximité',
    personnalite: 'Moderne, fiable, accessible',
    recherche: '',
  },
  couleurs: {
    clair: '#ffffff',
    sombre: '#1a1a1a',
    primaire: '#2563eb',
    secondaire: '#64748b',
  },
  typographie: {
    principale: 'Helvetica',
    secondaire: 'Times-Roman',
    tertiaire: 'Courier',
  },
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
  const validFonts = ['Helvetica', 'Times-Roman', 'Courier'];
  const toBaseFont = (v) => {
    if (!v) return null;
    const s = String(v).trim();
    if (s.startsWith('custom:')) return s;
    const base = s.replace(/-Bold|-Oblique|-Italic|-BoldOblique|-BoldItalic/g, '');
    return validFonts.includes(base) ? base : null;
  };
  const getFont = (v, fallback) => toBaseFont(v) ?? fallback;
  return {
    principale: getFont(typo.principale ?? typo.titre, 'Helvetica'),
    secondaire: getFont(typo.secondaire ?? typo.corps, 'Times-Roman'),
    tertiaire: getFont(typo.tertiaire, 'Courier'),
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

export const CHARTE_TEMPLATES = {
  startup: {
    label: 'Startup tech',
    config: {
      projet: { nom: 'Ma Startup', description: 'Charte graphique — identité digitale' },
      marque: {
        slogan: 'Innover. Créer. Grandir.',
        mission: 'Accélérer la transformation digitale des PME.',
        valeurs: 'Agilité, Innovation, Transparence',
        personnalite: 'Dynamique, moderne, audacieuse',
      },
      couleurs: { clair: '#ffffff', sombre: '#0f172a', primaire: '#7c3aed', secondaire: '#06b6d4' },
      typographie: { principale: 'Helvetica', secondaire: 'Helvetica', tertiaire: 'Courier' },
    },
  },
  institution: {
    label: 'Institution',
    config: {
      projet: { nom: 'Institution', description: 'Charte graphique institutionnelle' },
      marque: {
        slogan: 'Au service du public',
        mission: 'Servir les citoyens avec excellence et intégrité.',
        valeurs: 'Service, Intégrité, Proximité',
        personnalite: 'Sérieuse, accessible, fiable',
      },
      couleurs: { clair: '#ffffff', sombre: '#1e293b', primaire: '#1e40af', secondaire: '#64748b' },
      typographie: { principale: 'Times-Roman', secondaire: 'Helvetica', tertiaire: 'Courier' },
    },
  },
  retail: {
    label: 'Commerce / Retail',
    config: {
      projet: { nom: 'Ma Boutique', description: 'Charte graphique retail' },
      marque: {
        slogan: 'Votre style, notre passion',
        mission: 'Offrir une expérience d\'achat unique et chaleureuse.',
        valeurs: 'Qualité, Proximité, Plaisir',
        personnalite: 'Chaleureuse, tendance, accueillante',
      },
      couleurs: { clair: '#fffbf5', sombre: '#292524', primaire: '#dc2626', secondaire: '#f59e0b' },
      typographie: { principale: 'Helvetica', secondaire: 'Times-Roman', tertiaire: 'Courier' },
    },
  },
};
