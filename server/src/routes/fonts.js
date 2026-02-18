import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { getDataDir } from '../dataDir.js';

export const fontsRouter = Router();
const fontsDir = () => path.join(getDataDir(), 'fonts');

const ACCEPTED_EXT = ['.ttf', '.otf', '.woff'];

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(fontsDir(), { recursive: true });
      cb(null, fontsDir());
    } catch (e) {
      cb(e, null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
    const id = `${base}-${Date.now()}${ext}`;
    cb(null, id);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ACCEPTED_EXT.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Format non supporté. Utilisez : .ttf, .otf ou .woff`), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

function familyIdFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  return `custom:${base}`;
}

function normalizedFontName(filename) {
  const base = path.basename(filename, path.extname(filename));
  return base.replace(/-[0-9]+$/, '').toLowerCase();
}

fontsRouter.get('/list', async (req, res) => {
  try {
    await fs.mkdir(fontsDir(), { recursive: true });
    const files = await fs.readdir(fontsDir());
    const seen = new Set();
    const fonts = files
      .filter((f) => ACCEPTED_EXT.includes(path.extname(f).toLowerCase()))
      .map((f) => {
        const id = familyIdFromFilename(f);
        const label = path.basename(f, path.extname(f)).replace(/-[0-9]+$/, '').replace(/-/g, ' ');
        return { id, label, filename: f };
      })
      .filter((f) => {
        const key = normalizedFontName(f.filename);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    res.json(fonts);
  } catch (err) {
    console.error('[fonts/list]', err);
    res.json([]);
  }
});

fontsRouter.post('/upload', (req, res, next) => {
  upload.single('font')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux (max 5 Mo)' : (err.message || 'Erreur upload');
      return res.status(400).json({ error: msg });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier. Envoyez un fichier .ttf, .otf ou .woff' });
  try {
    const incomingName = normalizedFontName(req.file.filename);
    const files = await fs.readdir(fontsDir()).catch(() => []);
    const existingNames = files
      .filter((f) => f !== req.file.filename && ACCEPTED_EXT.includes(path.extname(f).toLowerCase()))
      .map((f) => normalizedFontName(f));
    if (existingNames.includes(incomingName)) {
      const filePath = path.join(fontsDir(), req.file.filename);
      await fs.unlink(filePath).catch(() => {});
      return res.status(400).json({ error: 'Une police avec ce nom existe déjà' });
    }
    const id = familyIdFromFilename(req.file.filename);
    const label = path.basename(req.file.filename, path.extname(req.file.filename)).replace(/-[0-9]+$/, '').replace(/-/g, ' ');
    res.json({ id, label, filename: req.file.filename });
  } catch (err) {
    if (req.file?.filename) {
      const filePath = path.join(fontsDir(), req.file.filename);
      await fs.unlink(filePath).catch(() => {});
    }
    res.status(500).json({ error: err.message });
  }
});

fontsRouter.delete('/:filename', async (req, res) => {
  try {
    const filePath = path.join(fontsDir(), req.params.filename);
    await fs.unlink(filePath);
    res.json({ deleted: req.params.filename });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Police introuvable' });
    res.status(500).json({ error: err.message });
  }
});

export function getFontsDir() {
  return fontsDir();
}
