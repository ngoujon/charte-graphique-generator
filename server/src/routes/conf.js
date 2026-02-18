import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../index.js';

export const confRouter = Router();
const confDir = () => path.join(getDataDir(), 'conf');

const DEFAULT_CONF = {
  version: 1,
  projet: {
    nom: 'Mon Projet',
    description: 'Charte graphique du projet',
    auteur: '',
    date: new Date().toISOString().split('T')[0],
  },
  marque: {
    slogan: 'Votre slogan ici',
    mission: 'Notre mission est de...',
    valeurs: 'Innovation, Qualité, Proximité',
    personnalite: 'Moderne, fiable, accessible',
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
  logo: null,
};

confRouter.get('/', async (req, res) => {
  try {
    const confPath = path.join(confDir(), 'charte.json');
    try {
      const data = await fs.readFile(confPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.couleurs) parsed.couleurs = normalizeCouleurs(parsed.couleurs);
      if (parsed.typographie) parsed.typographie = normalizeTypographie(parsed.typographie);
      res.json(parsed);
    } catch {
      res.json(DEFAULT_CONF);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function normalizeCouleurs(couleurs) {
  if (!couleurs || typeof couleurs !== 'object') return DEFAULT_CONF.couleurs;
  return {
    clair: couleurs.clair ?? couleurs.fond ?? couleurs.blanc ?? DEFAULT_CONF.couleurs.clair,
    sombre: couleurs.sombre ?? couleurs.texte ?? couleurs.noir ?? DEFAULT_CONF.couleurs.sombre,
    primaire: couleurs.primaire ?? DEFAULT_CONF.couleurs.primaire,
    secondaire: couleurs.secondaire ?? DEFAULT_CONF.couleurs.secondaire,
  };
}

function normalizeTypographie(typo) {
  if (!typo || typeof typo !== 'object') return DEFAULT_CONF.typographie;
  const validFonts = ['Helvetica', 'Times-Roman', 'Courier'];
  const toBaseFont = (v) => {
    if (!v) return null;
    const base = String(v).replace(/-Bold|-Oblique|-Italic|-BoldOblique|-BoldItalic/g, '');
    return validFonts.includes(base) ? base : null;
  };
  const getFont = (v, fallback) => toBaseFont(v) ?? fallback;
  return {
    principale: getFont(typo.principale ?? typo.titre, 'Helvetica'),
    secondaire: getFont(typo.secondaire ?? typo.corps, 'Times-Roman'),
    tertiaire: getFont(typo.tertiaire, 'Courier'),
  };
}

confRouter.post('/', async (req, res) => {
  try {
    await fs.mkdir(confDir(), { recursive: true });
    const body = { ...req.body };
    if (body.couleurs) body.couleurs = normalizeCouleurs(body.couleurs);
    if (body.typographie) body.typographie = normalizeTypographie(body.typographie);
    const conf = { ...DEFAULT_CONF, ...body, version: 1 };
    await fs.writeFile(
      path.join(confDir(), 'charte.json'),
      JSON.stringify(conf, null, 2)
    );
    res.json(conf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/import', async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) return res.status(400).json({ error: 'Config requise' });
    await fs.mkdir(confDir(), { recursive: true });
    const imported = { ...config };
    if (imported.couleurs) imported.couleurs = normalizeCouleurs(imported.couleurs);
    if (imported.typographie) imported.typographie = normalizeTypographie(imported.typographie);
    const conf = { ...DEFAULT_CONF, ...imported, version: 1 };
    await fs.writeFile(
      path.join(confDir(), 'charte.json'),
      JSON.stringify(conf, null, 2)
    );
    res.json(conf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.get('/export', async (req, res) => {
  try {
    const confPath = path.join(confDir(), 'charte.json');
    const data = await fs.readFile(confPath, 'utf-8');
    const config = JSON.parse(data);
    res.setHeader('Content-Disposition', 'attachment; filename=charte-config.json');
    res.json(config);
  } catch {
    res.setHeader('Content-Disposition', 'attachment; filename=charte-config.json');
    res.json(DEFAULT_CONF);
  }
});
