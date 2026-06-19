import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import JSZip from 'jszip';
import { getDataDir } from '../dataDir.js';
import {
  DEFAULT_CONF,
  normalizeConfig,
  validateConfig,
  CHARTE_TEMPLATES,
} from '../../../shared/config.js';

export const confRouter = Router();
const confDir = () => path.join(getDataDir(), 'conf');
const inputDir = () => path.join(getDataDir(), 'input');
const fontsDir = () => path.join(getDataDir(), 'fonts');
const historyDir = () => path.join(confDir(), 'history');
const projectsDir = () => path.join(confDir(), 'projects');

const uploadZip = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

const MAX_HISTORY = 20;

async function readActiveRef() {
  try {
    const data = await fs.readFile(path.join(confDir(), 'active.json'), 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.ref || 'default';
  } catch {
    return 'default';
  }
}

async function writeActiveRef(ref) {
  await fs.mkdir(confDir(), { recursive: true });
  await fs.writeFile(path.join(confDir(), 'active.json'), JSON.stringify({ ref }, null, 2));
}

async function readConfigFile() {
  const confPath = path.join(confDir(), 'charte.json');
  const data = await fs.readFile(confPath, 'utf-8').catch(() => null);
  if (!data) return normalizeConfig({});
  try {
    return normalizeConfig(JSON.parse(data));
  } catch {
    return normalizeConfig({});
  }
}

async function writeConfigFile(conf, { snapshot = true } = {}) {
  await fs.mkdir(confDir(), { recursive: true });
  const normalized = normalizeConfig(conf);
  await fs.writeFile(path.join(confDir(), 'charte.json'), JSON.stringify(normalized, null, 2));

  const ref = await readActiveRef();
  await fs.mkdir(projectsDir(), { recursive: true });
  await fs.writeFile(
    path.join(projectsDir(), `${ref}.json`),
    JSON.stringify(normalized, null, 2)
  );

  if (snapshot) {
    await saveHistorySnapshot(normalized);
  }
  return normalized;
}

async function saveHistorySnapshot(conf) {
  await fs.mkdir(historyDir(), { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const id = `charte-${timestamp}`;
  await fs.writeFile(path.join(historyDir(), `${id}.json`), JSON.stringify(conf, null, 2));

  const files = (await fs.readdir(historyDir()).catch(() => []))
    .filter((f) => f.endsWith('.json'))
    .sort()
    .reverse();
  for (const f of files.slice(MAX_HISTORY)) {
    await fs.unlink(path.join(historyDir(), f)).catch(() => {});
  }
}

function refToFilename(ref) {
  const s = (ref || '').trim().replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '-') || 'sans-ref';
  return `conf-charte-graphique-${s}`;
}

confRouter.get('/', async (req, res) => {
  try {
    const conf = await readConfigFile();
    res.json(conf);
  } catch (err) {
    console.error('[conf GET]', err);
    res.json(normalizeConfig({}));
  }
});

confRouter.post('/', async (req, res) => {
  try {
    const validation = validateConfig(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: 'Configuration invalide', details: validation.error });
    }
    const conf = await writeConfigFile(validation.config);
    res.json(conf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/reset', async (req, res) => {
  try {
    const conf = normalizeConfig({
      ...DEFAULT_CONF,
      projet: { ...DEFAULT_CONF.projet, date: new Date().toISOString().split('T')[0] },
    });
    await writeConfigFile(conf, { snapshot: false });

    const inputPath = inputDir();
    const files = await fs.readdir(inputPath).catch(() => []);
    for (const name of files) {
      if (!name.startsWith('.')) {
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
    const validation = validateConfig(config);
    if (!validation.ok) {
      return res.status(400).json({ error: 'Configuration invalide', details: validation.error });
    }
    const conf = await writeConfigFile(validation.config, { snapshot: false });
    res.json(conf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.get('/export', async (req, res) => {
  try {
    const config = await readConfigFile();
    const ref = config?.projet?.reference || '';
    res.setHeader('Content-Disposition', `attachment; filename="${refToFilename(ref)}.json"`);
    res.json(config);
  } catch {
    res.setHeader('Content-Disposition', 'attachment; filename="conf-charte-graphique-sans-ref.json"');
    res.json(normalizeConfig({}));
  }
});

confRouter.get('/export/full', async (req, res) => {
  try {
    const zip = new JSZip();
    const config = await readConfigFile();
    const configRef = config?.projet?.reference || '';
    zip.file('charte.json', JSON.stringify(config, null, 2));

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
    res.setHeader('Content-Disposition', `attachment; filename="${refToFilename(configRef)}.zip"`);
    res.send(blob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.get('/export/figma-tokens', async (req, res) => {
  try {
    const config = await readConfigFile();
    const { couleurs, typographie, projet } = config;
    const tokens = {
      name: projet?.nom || 'Charte graphique',
      colors: {
        clair: { value: couleurs.clair, type: 'color' },
        sombre: { value: couleurs.sombre, type: 'color' },
        primaire: { value: couleurs.primaire, type: 'color' },
        secondaire: { value: couleurs.secondaire, type: 'color' },
      },
      typography: {
        principale: { value: typographie.principale, type: 'fontFamily' },
        secondaire: { value: typographie.secondaire, type: 'fontFamily' },
        tertiaire: { value: typographie.tertiaire, type: 'fontFamily' },
      },
    };
    const ref = projet?.reference || 'sans-ref';
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="figma-tokens-${refToFilename(ref)}.json"`);
    res.json(tokens);
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
      const validation = validateConfig(config);
      if (!validation.ok) {
        return res.status(400).json({ error: 'Configuration ZIP invalide', details: validation.error });
      }
      await writeConfigFile(validation.config, { snapshot: false });
    }

    await fs.mkdir(inputDir(), { recursive: true });
    const existingInput = await fs.readdir(inputDir()).catch(() => []);
    for (const name of existingInput) {
      if (name.startsWith('.')) continue;
      await fs.unlink(path.join(inputDir(), name)).catch(() => {});
    }
    const files = Object.keys(zip.files).filter((f) => f.startsWith('input/') && !f.endsWith('/'));
    for (const filePath of files) {
      const name = path.basename(filePath);
      const file = zip.file(filePath);
      if (file) {
        const buf = await file.async('nodebuffer');
        await fs.writeFile(path.join(inputDir(), name), buf);
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

    const conf = await readConfigFile();
    res.json(conf);
  } catch (err) {
    if (err.message?.includes('Zip')) {
      return res.status(400).json({ error: 'Fichier ZIP invalide' });
    }
    res.status(500).json({ error: err.message });
  }
});

confRouter.get('/history', async (req, res) => {
  try {
    await fs.mkdir(historyDir(), { recursive: true });
    const files = (await fs.readdir(historyDir()).catch(() => []))
      .filter((f) => f.endsWith('.json'))
      .sort()
      .reverse();
    const items = await Promise.all(
      files.map(async (name) => {
        const stat = await fs.stat(path.join(historyDir(), name));
        let projetNom = '';
        try {
          const data = JSON.parse(await fs.readFile(path.join(historyDir(), name), 'utf-8'));
          projetNom = data.projet?.nom || '';
        } catch { /* ignore */ }
        return { id: name.replace(/\.json$/, ''), name, modified: stat.mtime, projetNom };
      })
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/history/:id/restore', async (req, res) => {
  try {
    const id = req.params.id;
    if (id.includes('..') || id.includes('/')) {
      return res.status(400).json({ error: 'Identifiant invalide' });
    }
    const filePath = path.join(historyDir(), `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const validation = validateConfig(JSON.parse(data));
    if (!validation.ok) {
      return res.status(400).json({ error: 'Snapshot invalide' });
    }
    const conf = await writeConfigFile(validation.config, { snapshot: false });
    res.json(conf);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Version introuvable' });
    res.status(500).json({ error: err.message });
  }
});

confRouter.get('/templates', (req, res) => {
  const templates = Object.entries(CHARTE_TEMPLATES).map(([id, t]) => ({
    id,
    label: t.label,
  }));
  res.json(templates);
});

confRouter.post('/templates/:id/apply', async (req, res) => {
  try {
    const template = CHARTE_TEMPLATES[req.params.id];
    if (!template) return res.status(404).json({ error: 'Template introuvable' });
    const current = await readConfigFile();
    const merged = normalizeConfig({
      ...current,
      ...template.config,
      projet: { ...current.projet, ...template.config.projet },
      marque: { ...current.marque, ...template.config.marque },
      couleurs: { ...current.couleurs, ...template.config.couleurs },
      typographie: { ...current.typographie, ...template.config.typographie },
    });
    const conf = await writeConfigFile(merged, { snapshot: false });
    res.json(conf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.get('/projects', async (req, res) => {
  try {
    await fs.mkdir(projectsDir(), { recursive: true });
    const activeRef = await readActiveRef();
    const files = (await fs.readdir(projectsDir()).catch(() => [])).filter((f) => f.endsWith('.json'));
    const projects = await Promise.all(
      files.map(async (name) => {
        const ref = name.replace(/\.json$/, '');
        let projetNom = ref;
        try {
          const data = JSON.parse(await fs.readFile(path.join(projectsDir(), name), 'utf-8'));
          projetNom = data.projet?.nom || ref;
        } catch { /* ignore */ }
        return { ref, projetNom, active: ref === activeRef };
      })
    );
    if (projects.length === 0) {
      const conf = await readConfigFile();
      await fs.writeFile(path.join(projectsDir(), 'default.json'), JSON.stringify(conf, null, 2));
      return res.json([{ ref: 'default', projetNom: conf.projet?.nom || 'default', active: true }]);
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/projects', async (req, res) => {
  try {
    const { ref, duplicateFrom } = req.body;
    if (!ref || typeof ref !== 'string') {
      return res.status(400).json({ error: 'Référence projet requise' });
    }
    const safeRef = ref.trim().replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '-');
    if (!safeRef) return res.status(400).json({ error: 'Référence invalide' });

    await fs.mkdir(projectsDir(), { recursive: true });
    const destPath = path.join(projectsDir(), `${safeRef}.json`);
    if (await fs.access(destPath).then(() => true).catch(() => false)) {
      return res.status(400).json({ error: 'Ce projet existe déjà' });
    }

    let base = normalizeConfig({});
    if (duplicateFrom) {
      const srcPath = path.join(projectsDir(), `${duplicateFrom}.json`);
      const data = await fs.readFile(srcPath, 'utf-8');
      base = normalizeConfig(JSON.parse(data));
    } else {
      base = await readConfigFile();
    }
    base.projet = { ...base.projet, reference: safeRef };
    await fs.writeFile(destPath, JSON.stringify(base, null, 2));
    res.json({ ref: safeRef, projetNom: base.projet?.nom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

confRouter.post('/projects/:ref/activate', async (req, res) => {
  try {
    const ref = req.params.ref;
    if (ref.includes('..') || ref.includes('/')) {
      return res.status(400).json({ error: 'Référence invalide' });
    }
    const projectPath = path.join(projectsDir(), `${ref}.json`);
    const data = await fs.readFile(projectPath, 'utf-8');
    const conf = normalizeConfig(JSON.parse(data));
    await writeActiveRef(ref);
    await fs.writeFile(path.join(confDir(), 'charte.json'), JSON.stringify(conf, null, 2));
    res.json(conf);
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Projet introuvable' });
    res.status(500).json({ error: err.message });
  }
});

export { normalizeConfig, DEFAULT_CONF };
