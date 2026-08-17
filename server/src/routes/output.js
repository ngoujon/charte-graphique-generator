import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../dataDir.js';
import { assertSafeFilename } from '../utils/safeFilename.js';

export const outputRouter = Router();
const outputDir = () => path.join(getDataDir(), 'output');
const trashDir = () => path.join(getDataDir(), 'trash');

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
    console.error('[output/files]', err);
    res.json([]);
  }
});

outputRouter.get('/files/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  if (!assertSafeFilename(name, res)) return;
  const filePath = path.join(outputDir(), name);
  res.sendFile(filePath, { headers: { 'Cache-Control': 'private, max-age=3600' } }, (err) => {
    if (err) res.status(404).json({ error: 'Fichier introuvable' });
  });
});

outputRouter.delete('/files', async (req, res) => {
  try {
    await fs.mkdir(outputDir(), { recursive: true });
    const files = await fs.readdir(outputDir());
    const pdfs = files.filter((f) => f.endsWith('.pdf'));
    await fs.mkdir(trashDir(), { recursive: true });
    let moved = 0;
    for (const name of pdfs) {
      const srcPath = path.join(outputDir(), name);
      const destPath = path.join(trashDir(), name);
      await fs.unlink(destPath).catch(() => {});
      await fs.rename(srcPath, destPath);
      moved++;
    }
    res.json({ moved, count: moved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

outputRouter.delete('/files/:name', async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    if (!name.endsWith('.pdf')) {
      return res.status(400).json({ error: 'Seuls les PDF peuvent être supprimés' });
    }
    if (name.includes('..') || path.isAbsolute(name)) {
      return res.status(400).json({ error: 'Nom de fichier invalide' });
    }
    const srcPath = path.join(outputDir(), name);
    await fs.access(srcPath);
    await fs.mkdir(trashDir(), { recursive: true });
    const destPath = path.join(trashDir(), name);
    await fs.unlink(destPath).catch(() => {});
    await fs.rename(srcPath, destPath);
    res.json({ moved: name });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Fichier introuvable' });
    res.status(500).json({ error: err.message });
  }
});

outputRouter.get('/trash/files', async (req, res) => {
  try {
    await fs.mkdir(trashDir(), { recursive: true });
    const files = await fs.readdir(trashDir());
    const details = await Promise.all(
      files
        .filter((f) => f.endsWith('.pdf'))
        .map(async (name) => {
          const stat = await fs.stat(path.join(trashDir(), name));
          return { name, size: stat.size, modified: stat.mtime };
        })
    );
    res.json(details.sort((a, b) => new Date(b.modified) - new Date(a.modified)));
  } catch (err) {
    console.error('[output/trash/files]', err);
    res.json([]);
  }
});

outputRouter.get('/trash/files/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  if (!assertSafeFilename(name, res)) return;
  const filePath = path.join(trashDir(), name);
  res.sendFile(filePath, { headers: { 'Cache-Control': 'private, max-age=3600' } }, (err) => {
    if (err) res.status(404).json({ error: 'Fichier introuvable' });
  });
});

outputRouter.post('/trash/files/:name/restore', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  if (!assertSafeFilename(name, res)) return;
  try {
    const srcPath = path.join(trashDir(), name);
    await fs.access(srcPath);
    const destPath = path.join(outputDir(), name);
    await fs.mkdir(outputDir(), { recursive: true });
    await fs.rename(srcPath, destPath);
    res.json({ restored: name });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Fichier introuvable' });
    res.status(500).json({ error: err.message });
  }
});

outputRouter.delete('/trash/files/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  if (!assertSafeFilename(name, res)) return;
  try {
    const filePath = path.join(trashDir(), name);
    await fs.unlink(filePath);
    res.json({ deleted: name });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Fichier introuvable' });
    res.status(500).json({ error: err.message });
  }
});
