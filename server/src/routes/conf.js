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
  couleurs: {
    primaire: '#2563eb',
    secondaire: '#64748b',
    accent: '#f59e0b',
    fond: '#ffffff',
    texte: '#1e293b',
  },
  typographie: {
    titre: 'Helvetica-Bold',
    corps: 'Helvetica',
    tailleTitre: 24,
    tailleSousTitre: 18,
    tailleCorps: 12,
  },
  logo: null,
};

confRouter.get('/', async (req, res) => {
  try {
    const confPath = path.join(confDir(), 'charte.json');
    try {
      const data = await fs.readFile(confPath, 'utf-8');
      res.json(JSON.parse(data));
    } catch {
      res.json(DEFAULT_CONF);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/', async (req, res) => {
  try {
    await fs.mkdir(confDir(), { recursive: true });
    const conf = { ...DEFAULT_CONF, ...req.body, version: 1 };
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
    const conf = { ...DEFAULT_CONF, ...config, version: 1 };
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
    res.json(DEFAULT_CONF);
  }
});
