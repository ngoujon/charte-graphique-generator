import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { getDataDir } from '../dataDir.js';
import { assertSafeFilename } from '../utils/safeFilename.js';
import { listFilesInDir } from '../utils/listFiles.js';

export const inputRouter = Router();
const inputDir = () => path.join(getDataDir(), 'input');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, inputDir()),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, path.basename(file.originalname, path.extname(file.originalname)) + '-' + uniqueSuffix + ext);
  },
});

const createLogoStorage = (logoType) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, inputDir()),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `logo-${logoType}-${Date.now()}${ext}`);
    },
  });

const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo par fichier

const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Type de fichier non autorisé (images uniquement : PNG, JPEG, WebP, SVG)'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter: imageFileFilter, limits: { fileSize: MAX_FILE_SIZE } });

inputRouter.get('/files', async (req, res) => {
  try {
    const details = await listFilesInDir(inputDir());
    res.json(details);
  } catch (err) {
    console.error('[input/files]', err);
    res.json([]);
  }
});

inputRouter.post('/upload', upload.array('files', 20), (req, res) => {
  const files = (req.files || []).map((f) => ({ name: f.filename, size: f.size }));
  res.json({ uploaded: files });
});

['clair', 'sombre', 'primaire', 'secondaire'].forEach((type) => {
  inputRouter.post(`/upload/logo/${type}`, multer({ storage: createLogoStorage(type), fileFilter: imageFileFilter, limits: { fileSize: MAX_FILE_SIZE } }).single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier' });
    try {
      const files = await fs.readdir(inputDir());
      const toDelete = files.filter((f) => f.startsWith(`logo-${type}-`) && f !== req.file.filename);
      await Promise.all(toDelete.map((f) => fs.unlink(path.join(inputDir(), f))));
    } catch (e) {
      console.warn('Could not remove old logos:', e.message);
    }
    res.json({ uploaded: { name: req.file.filename, size: req.file.size } });
  });
});

inputRouter.delete('/files/:name', async (req, res) => {
  const name = decodeURIComponent(req.params.name);
  if (!assertSafeFilename(name, res)) return;
  try {
    const filePath = path.join(inputDir(), name);
    await fs.unlink(filePath);
    res.json({ deleted: name });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Fichier introuvable' });
    res.status(500).json({ error: err.message });
  }
});

inputRouter.get('/files/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  if (!assertSafeFilename(name, res)) return;
  const filePath = path.join(inputDir(), name);
  res.sendFile(filePath, { headers: { 'Cache-Control': 'private, max-age=3600' } }, (err) => {
    if (err) res.status(404).json({ error: 'Fichier introuvable' });
  });
});
