import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { DATA_DIR } from './dataDir.js';
import { inputRouter } from './routes/input.js';
import { outputRouter } from './routes/output.js';
import { confRouter } from './routes/conf.js';
import { generateRouter } from './routes/generate.js';
import { fontsRouter } from './routes/fonts.js';
import { bootstrapRouter } from './routes/bootstrap.js';
import { scheduleAutoPurge } from './utils/purge.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;

async function initDataDir() {
  const dirs = [
    path.join(DATA_DIR, 'input'),
    path.join(DATA_DIR, 'output'),
    path.join(DATA_DIR, 'trash'),
    path.join(DATA_DIR, 'conf'),
    path.join(DATA_DIR, 'fonts'),
    path.join(DATA_DIR, 'conf', 'history'),
    path.join(DATA_DIR, 'conf', 'projects'),
  ];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

const app = express();
app.use(helmet({
  contentSecurityPolicy: false, // sert aussi le client statique, CSP à affiner si besoin
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS_ORIGIN peut lister une ou plusieurs origines séparées par des virgules.
// Sans configuration, ouvert (usage local uniquement) — à restreindre en production.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : true;
app.use(cors({ origin: corsOrigin }));

app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

const generateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de générations demandées, réessayez dans quelques minutes.' },
});
app.use('/api/generate', generateLimiter);

const publicDir = path.join(__dirname, '..', 'public');
const hasPublic = await fs.access(publicDir).then(() => true).catch(() => false);

if (hasPublic) {
  app.use(express.static(publicDir));
}

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// API routes
app.use('/api/input', inputRouter);
app.use('/api/output', outputRouter);
app.use('/api/conf', confRouter);
app.use('/api/generate', generateRouter);
app.use('/api/fonts', fontsRouter);
app.use('/api/bootstrap', bootstrapRouter);

if (hasPublic) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('[Erreur]', err.message || err);
  res.status(500).json({ error: err.message || 'Erreur serveur' });
});

initDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`Charte Graphique Generator running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
  });
  scheduleAutoPurge();
}).catch((err) => {
  console.error('Impossible d\'initialiser le répertoire data:', err);
  process.exit(1);
});
