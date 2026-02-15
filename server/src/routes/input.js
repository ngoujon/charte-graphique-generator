import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { getDataDir } from '../index.js';

export const inputRouter = Router();
const inputDir = () => path.join(getDataDir(), 'input');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, inputDir()),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, path.basename(file.originalname, ext) + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

inputRouter.get('/files', async (req, res) => {
  try {
    await fs.mkdir(inputDir(), { recursive: true });
    const files = await fs.readdir(inputDir());
    const details = await Promise.all(
      files
        .filter((f) => !f.startsWith('.'))
        .map(async (name) => {
          const stat = await fs.stat(path.join(inputDir(), name));
          return { name, size: stat.size, modified: stat.mtime };
        })
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inputRouter.post('/upload', upload.array('files', 20), (req, res) => {
  const files = (req.files || []).map((f) => ({ name: f.filename, size: f.size }));
  res.json({ uploaded: files });
});

inputRouter.delete('/files/:name', async (req, res) => {
  try {
    const filePath = path.join(inputDir(), req.params.name);
    await fs.unlink(filePath);
    res.json({ deleted: req.params.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

inputRouter.get('/files/:name', (req, res) => {
  const filePath = path.join(inputDir(), req.params.name);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ error: 'File not found' });
  });
});
