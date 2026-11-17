import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDataDir } from '../dataDir.js';
import { generatePdf, generatePdfBuffer } from '../pdf/generator.js';
import { normalizeConfig, validateConfig } from '../../../shared/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateRouter = Router();

const IMAGE_RE = /\.(png|jpe?g|svg|webp)$/i;
const QWEBTY_LOGO_CANDIDATES = [
  path.join(__dirname, '..', '..', 'public', 'qwebty-logo.png'),
  path.join(__dirname, '..', '..', '..', 'client', 'public', 'qwebty-logo.png'),
];

/** Une seule génération à la fois : les demandes suivantes attendent leur tour. */
let queue = Promise.resolve();
function exclusive(task) {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

async function readSavedConfig(dataDir) {
  try {
    const data = await fs.readFile(path.join(dataDir, 'conf', 'charte.json'), 'utf-8');
    return normalizeConfig(JSON.parse(data));
  } catch {
    return normalizeConfig({});
  }
}

async function collectInputs(dataDir) {
  const inputDir = path.join(dataDir, 'input');
  const files = (await fs.readdir(inputDir).catch(() => [])).filter((f) => IMAGE_RE.test(f)).sort();
  let qwebtyLogoPath = null;
  for (const candidate of QWEBTY_LOGO_CANDIDATES) {
    if (await fs.access(candidate).then(() => true).catch(() => false)) {
      qwebtyLogoPath = candidate;
      break;
    }
  }
  return {
    imagePaths: files.map((name) => path.join(inputDir, name)),
    opts: { qwebtyLogoPath, fontsDir: path.join(dataDir, 'fonts') },
  };
}

function slug(value) {
  return (
    String(value || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'projet'
  );
}

/** Génère le PDF final dans data/output. */
generateRouter.post('/', async (req, res) => {
  try {
    const result = await exclusive(async () => {
      const dataDir = getDataDir();
      const config = await readSavedConfig(dataDir);
      const { imagePaths, opts } = await collectInputs(dataDir);
      const outputDir = path.join(dataDir, 'output');
      await fs.mkdir(outputDir, { recursive: true });
      const now = new Date();
      const stamp = now.toISOString().slice(0, 16).replace('T', '-').replace(/:/g, 'h');
      const ref = config.projet?.reference ? `-${slug(config.projet.reference)}` : '';
      const filename = `charte-graphique-${slug(config.projet?.nom)}${ref}-${stamp}.pdf`;
      await generatePdf(config, imagePaths, path.join(outputDir, filename), opts);
      return { success: true, filename };
    });
    res.json(result);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Aperçu : rend le PDF en mémoire à partir de la configuration envoyée
 * (ou de celle enregistrée), sans rien écrire sur le disque.
 */
generateRouter.post('/preview', async (req, res) => {
  try {
    const { buffer, pageMap } = await exclusive(async () => {
      const dataDir = getDataDir();
      let config;
      if (req.body && Object.keys(req.body).length) {
        const validation = validateConfig(req.body);
        if (!validation.ok) {
          const err = new Error('Configuration invalide');
          err.status = 400;
          throw err;
        }
        config = validation.config;
      } else {
        config = await readSavedConfig(dataDir);
      }
      const { imagePaths, opts } = await collectInputs(dataDir);
      return generatePdfBuffer(config, imagePaths, opts);
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="apercu.pdf"');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Charte-Pages', JSON.stringify(pageMap));
    res.send(buffer);
  } catch (err) {
    console.error('PDF preview error:', err);
    res.status(err.status || 500).json({ error: err.message });
  }
});
