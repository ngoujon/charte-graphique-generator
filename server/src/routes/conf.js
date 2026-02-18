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
    titre: 'Helvetica-Bold',
    corps: 'Helvetica',
    tailleTitre: 24,
    tailleSousTitre: 18,
    tailleCorps: 12,
    exempleTitre: "Titre de l'exemple",
    exempleSousTitre: "Sous-titre de l'exemple",
    exempleDescription:
      'Description ou corps de texte. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  logo: null,
};

confRouter.get('/', async (req, res) => {
  try {
    const confPath = path.join(confDir(), 'charte.json');
    try {
      const data = await fs.readFile(confPath, 'utf-8');
      const trimmed = (data || '').trim();
      if (!trimmed) {
        res.json(DEFAULT_CONF);
        return;
      }
      const parsed = JSON.parse(trimmed);
      if (parsed.couleurs) parsed.couleurs = normalizeCouleurs(parsed.couleurs);
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

confRouter.post('/', async (req, res) => {
  try {
    await fs.mkdir(confDir(), { recursive: true });
    const body = { ...req.body };
    if (body.couleurs) body.couleurs = normalizeCouleurs(body.couleurs);
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
    const trimmed = (data || '').trim();
    const config = trimmed ? JSON.parse(trimmed) : DEFAULT_CONF;
    res.setHeader('Content-Disposition', 'attachment; filename=charte-config.json');
    res.json(config);
  } catch {
    res.json(DEFAULT_CONF);
  }
});
