import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../index.js';
import { generatePdf } from '../pdf/generator.js';

export const generateRouter = Router();

generateRouter.post('/', async (req, res) => {
  try {
    const dataDir = getDataDir();
    const inputDir = path.join(dataDir, 'input');
    const outputDir = path.join(dataDir, 'output');
    const confPath = path.join(dataDir, 'conf', 'charte.json');

    let config = {};
    try {
      const confData = await fs.readFile(confPath, 'utf-8');
      config = JSON.parse(confData);
    } catch {
      config = {
        projet: { nom: 'Charte Graphique', description: '' },
        couleurs: { primaire: '#2563eb', secondaire: '#64748b', texte: '#1e293b' },
        typographie: { titre: 'Helvetica-Bold', corps: 'Helvetica' },
      };
    }

    const inputFiles = await fs.readdir(inputDir).catch(() => []);
    const images = inputFiles
      .filter((f) => /\.(png|jpg|jpeg|svg|webp)$/i.test(f))
      .map((name) => path.join(inputDir, name));

    await fs.mkdir(outputDir, { recursive: true });
    const filename = `charte-graphique-${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, filename);

    await generatePdf(config, images, outputPath);

    res.json({ success: true, filename });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: err.message });
  }
});
