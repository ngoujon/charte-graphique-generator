import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../index.js';

export const outputRouter = Router();
const outputDir = () => path.join(getDataDir(), 'output');

outputRouter.get('/files', async (req, res) => {
  try {
    await fs.mkdir(outputDir(), { recursive: true });
    const files = await fs.readdir(outputDir());
    const details = await Promise.all(
      files
        .filter((f) => f.endsWith('.pdf'))
        .map(async (name) => {
          const stat = await fs.stat(path.join(outputDir(), name));
          return { name, size: stat.size, modified: stat.mtime };
        })
    );
    res.json(details.sort((a, b) => new Date(b.modified) - new Date(a.modified)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

outputRouter.get('/files/:name', (req, res) => {
  const filePath = path.join(outputDir(), req.params.name);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: 'File not found' });
  });
});
