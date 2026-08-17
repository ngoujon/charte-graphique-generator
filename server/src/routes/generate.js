import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDataDir } from '../dataDir.js';
import { generatePdf } from '../pdf/generator.js';
import { normalizeConfig } from '../../../shared/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateRouter = Router();

let isGenerating = false;

generateRouter.post('/', async (req, res) => {
  if (isGenerating) {
    return res.status(409).json({ error: 'Une génération est déjà en cours, veuillez patienter.' });
  }
  isGenerating = true;
  try {
    const dataDir = getDataDir();
    const inputDir = path.join(dataDir, 'input');
    const outputDir = path.join(dataDir, 'output');
    const confPath = path.join(dataDir, 'conf', 'charte.json');

    let config = normalizeConfig({});
    try {
      const confData = await fs.readFile(confPath, 'utf-8');
      config = normalizeConfig(JSON.parse(confData));
    } catch {
      /* utilise DEFAULT_CONF via normalizeConfig */
    }

    const inputFiles = await fs.readdir(inputDir).catch(() => []);
    const images = inputFiles
      .filter((f) => /\.(png|jpg|jpeg|svg|webp)$/i.test(f))
      .map((name) => path.join(inputDir, name));

    await fs.mkdir(outputDir, { recursive: true });
    const ref = (config.projet?.reference || '').trim().replace(/[/\\:*?"<>|]/g, '-').replace(/\s+/g, '-') || 'sans-ref';
    const now = new Date();
    const datetime = now.toISOString().slice(0, 19).replace('T', '-').replace(/:/g, '');
    const filename = `charte-graphique-${ref}-${datetime}.pdf`;
    const outputPath = path.join(outputDir, filename);

    const logoPath = path.join(__dirname, '..', 'public', 'qwebty-logo.png');
    const logoExists = await fs.access(logoPath).then(() => true).catch(() => false);

    await generatePdf(config, images, outputPath, logoExists ? logoPath : null, dataDir);

    res.json({ success: true, filename });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message });
  } finally {
    isGenerating = false;
  }
});
