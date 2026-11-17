import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import { getDataDir } from '../dataDir.js';
import { assertSafeFilename } from '../utils/safeFilename.js';
import { listFilesInDir } from '../utils/listFiles.js';
import { normalizeFontName } from '../../../shared/normalizeFontName.js';
import { CATALOG_FONTS } from '../../../shared/fonts.js';
import { catalogFilesDir } from '../pdf/fonts.js';

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
      cb(new Error('Format non supporté. Utilisez : .ttf, .otf ou .woff'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

function familyIdFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename));
  return `custom:${base}`;
}

function normalizedFontName(filename) {
  return normalizeFontName(path.basename(filename, path.extname(filename)));
}

fontsRouter.get('/list', async (req, res) => {
  try {
    const files = await listFilesInDir(fontsDir(), (f) =>
      ACCEPTED_EXT.includes(path.extname(f).toLowerCase())
    );
    const seen = new Set();
    const fonts = files
      .map((f) => {
        const id = familyIdFromFilename(f.name);
        const label = path.basename(f.name, path.extname(f.name)).replace(/-[0-9]+$/, '').replace(/-/g, ' ');
        return { id, label, filename: f.name };
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

const FONT_CACHE = { 'Cache-Control': 'public, max-age=604800, immutable' };

/** Fichiers des polices du catalogue (aperçu dans le navigateur). */
fontsRouter.get('/catalog/:file', (req, res) => {
  const { file } = req.params;
  const match = /^([a-z0-9-]+)-latin-(\d{3})-(normal|italic)\.woff$/.exec(file);
  const font = match && CATALOG_FONTS.find((f) => f.pkg === match[1]);
  const dir = font && catalogFilesDir(font);
  if (!dir) return res.status(404).json({ error: 'Police introuvable' });
  res.sendFile(path.join(dir, file), { headers: FONT_CACHE }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'Police introuvable' });
  });
});

/** Fichiers des polices importées (aperçu dans le navigateur). */
fontsRouter.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!assertSafeFilename(filename, res)) return;
  if (!ACCEPTED_EXT.includes(path.extname(filename).toLowerCase())) {
    return res.status(400).json({ error: 'Format non supporté' });
  }
  res.sendFile(path.join(fontsDir(), filename), { headers: FONT_CACHE }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'Police introuvable' });
  });
});

fontsRouter.delete('/:filename', async (req, res) => {
  const filename = decodeURIComponent(req.params.filename);
  if (!assertSafeFilename(filename, res)) return;
  try {
    const filePath = path.join(fontsDir(), filename);
    await fs.unlink(filePath);
    res.json({ deleted: filename });
  } catch (err) {
    if (err.code === 'ENOENT') return res.status(404).json({ error: 'Police introuvable' });
    res.status(500).json({ error: err.message });
  }
});

export function getFontsDir() {
  return fontsDir();
}
