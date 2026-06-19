import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../dataDir.js';
import { listFilesInDir } from '../utils/listFiles.js';
import { normalizeConfig } from '../../../shared/config.js';

export const bootstrapRouter = Router();

const confPath = () => path.join(getDataDir(), 'conf', 'charte.json');
const inputDir = () => path.join(getDataDir(), 'input');
const outputDir = () => path.join(getDataDir(), 'output');
const trashDir = () => path.join(getDataDir(), 'trash');
const fontsDir = () => path.join(getDataDir(), 'fonts');

bootstrapRouter.get('/', async (req, res) => {
  try {
    let config = normalizeConfig({});
    try {
      const data = await fs.readFile(confPath(), 'utf-8');
      config = normalizeConfig(JSON.parse(data));
    } catch { /* default */ }

    const [inputFiles, outputRaw, trashRaw, fontFiles] = await Promise.all([
      listFilesInDir(inputDir()),
      listFilesInDir(outputDir(), (f) => f.endsWith('.pdf')),
      listFilesInDir(trashDir(), (f) => f.endsWith('.pdf')),
      listFilesInDir(fontsDir(), (f) => ['.ttf', '.otf', '.woff'].includes(path.extname(f).toLowerCase())),
    ]);

    const outputFiles = outputRaw.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    const trashFiles = trashRaw.sort((a, b) => new Date(b.modified) - new Date(a.modified));

    const seen = new Set();
    const fonts = fontFiles
      .map((f) => {
        const base = path.basename(f.name, path.extname(f.name));
        const id = `custom:${base}`;
        const label = base.replace(/-[0-9]+$/, '').replace(/-/g, ' ');
        return { id, label, filename: f.name };
      })
      .filter((f) => {
        const key = f.filename.replace(/-[0-9]+\.[^.]+$/, '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    res.json({ config, inputFiles, outputFiles, trashFiles, fonts });
  } catch (err) {
    console.error('[bootstrap]', err);
    res.status(500).json({ error: err.message });
  }
});
