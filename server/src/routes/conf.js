import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import JSZip from 'jszip';
import { getDataDir } from '../dataDir.js';

export const confRouter = Router();
const confDir = () => path.join(getDataDir(), 'conf');
const inputDir = () => path.join(getDataDir(), 'input');
const fontsDir = () => path.join(getDataDir(), 'fonts');

const uploadZip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const DEFAULT_CONF = {
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
  logo: null,
};

confRouter.get('/', async (req, res) => {
  try {
    const confPath = path.join(confDir(), 'charte.json');
    const data = await fs.readFile(confPath, 'utf-8').catch(() => null);
    if (!data) return res.json(DEFAULT_CONF);
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      return res.json(DEFAULT_CONF);
    }
    try {
      if (parsed.couleurs) parsed.couleurs = normalizeCouleurs(parsed.couleurs);
      if (parsed.typographie) parsed.typographie = normalizeTypographie(parsed.typographie);
      res.json(parsed);
    } catch {
      res.json(DEFAULT_CONF);
    }
  } catch (err) {
    console.error('[conf GET]', err);
    res.json(DEFAULT_CONF);
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

confRouter.post('/reset', async (req, res) => {
  try {
    await fs.mkdir(confDir(), { recursive: true });
    const conf = { ...DEFAULT_CONF, version: 1 };
    conf.projet = { ...DEFAULT_CONF.projet, date: new Date().toISOString().split('T')[0] };
    await fs.writeFile(path.join(confDir(), 'charte.json'), JSON.stringify(conf, null, 2));

    const inputPath = inputDir();
    const files = await fs.readdir(inputPath).catch(() => []);
    const logoPrefixes = ['logo-clair-', 'logo-sombre-', 'logo-primaire-', 'logo-secondaire-'];
    for (const name of files) {
      if (logoPrefixes.some((p) => name.startsWith(p))) {
        await fs.unlink(path.join(inputPath, name)).catch(() => {});
      }
    }

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

confRouter.get('/export/full', async (req, res) => {
  try {
    const zip = new JSZip();

    const confPath = path.join(confDir(), 'charte.json');
    try {
      const configData = await fs.readFile(confPath, 'utf-8');
      zip.file('charte.json', configData);
    } catch {
      zip.file('charte.json', JSON.stringify(DEFAULT_CONF, null, 2));
    }

    const inputPath = inputDir();
    const inputFiles = await fs.readdir(inputPath).catch(() => []);
    for (const name of inputFiles) {
      if (name.startsWith('.')) continue;
      const filePath = path.join(inputPath, name);
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        const buf = await fs.readFile(filePath);
        zip.file(`input/${name}`, buf);
      }
    }

    const fontsPath = fontsDir();
    const fontFiles = await fs.readdir(fontsPath).catch(() => []);
    const fontExt = ['.ttf', '.otf', '.woff'];
    for (const name of fontFiles) {
      if (!fontExt.includes(path.extname(name).toLowerCase())) continue;
      const filePath = path.join(fontsPath, name);
      const buf = await fs.readFile(filePath);
      zip.file(`fonts/${name}`, buf);
    }

    const blob = await zip.generateAsync({ type: 'nodebuffer' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=charte-complete.zip');
    res.send(blob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/import/full', uploadZip.single('file'), async (req, res) => {
  try {
    if (!req.file?.buffer) return res.status(400).json({ error: 'Fichier ZIP requis' });
    const zip = await JSZip.loadAsync(req.file.buffer);

    const charteFile = zip.file('charte.json');
    if (charteFile) {
      const configData = await charteFile.async('string');
      const config = JSON.parse(configData);
      const imported = { ...config };
      if (imported.couleurs) imported.couleurs = normalizeCouleurs(imported.couleurs);
      if (imported.typographie) imported.typographie = normalizeTypographie(imported.typographie);
      const conf = { ...DEFAULT_CONF, ...imported, version: 1 };
      await fs.mkdir(confDir(), { recursive: true });
      await fs.writeFile(path.join(confDir(), 'charte.json'), JSON.stringify(conf, null, 2));
    }

    await fs.mkdir(inputDir(), { recursive: true });
    const existingInput = await fs.readdir(inputDir()).catch(() => []);
    for (const name of existingInput) {
      if (name.startsWith('.')) continue;
      await fs.unlink(path.join(inputDir(), name)).catch(() => {});
    }
    {
      const files = Object.keys(zip.files).filter((f) => f.startsWith('input/') && !f.endsWith('/'));
      for (const filePath of files) {
        const name = path.basename(filePath);
        const file = zip.file(filePath);
        if (file) {
          const buf = await file.async('nodebuffer');
          await fs.writeFile(path.join(inputDir(), name), buf);
        }
      }
    }

    await fs.mkdir(fontsDir(), { recursive: true });
    const fontExt = ['.ttf', '.otf', '.woff'];
    const existingFonts = await fs.readdir(fontsDir()).catch(() => []);
    for (const name of existingFonts) {
      if (fontExt.includes(path.extname(name).toLowerCase())) {
        await fs.unlink(path.join(fontsDir(), name)).catch(() => {});
      }
    }
    const fontFiles = Object.keys(zip.files).filter(
      (f) => f.startsWith('fonts/') && !f.endsWith('/') && fontExt.includes(path.extname(f).toLowerCase())
    );
    for (const filePath of fontFiles) {
      const name = path.basename(filePath);
      const file = zip.file(filePath);
      if (file) {
        const buf = await file.async('nodebuffer');
        await fs.writeFile(path.join(fontsDir(), name), buf);
      }
    }

    const confPath = path.join(confDir(), 'charte.json');
    const data = await fs.readFile(confPath, 'utf-8');
    const conf = JSON.parse(data);
    if (conf.couleurs) conf.couleurs = normalizeCouleurs(conf.couleurs);
    if (conf.typographie) conf.typographie = normalizeTypographie(conf.typographie);
    res.json(conf);
  } catch (err) {
    if (err.message?.includes('Zip')) {
      return res.status(400).json({ error: 'Fichier ZIP invalide' });
    }
    res.status(500).json({ error: err.message });
  }
});
