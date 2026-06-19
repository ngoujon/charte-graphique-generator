import express from 'express';
import cors from 'cors';
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
app.use(cors());
app.use(express.json({ limit: '10mb' }));

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
}).catch((err) => {
  console.error('Impossible d\'initialiser le répertoire data:', err);
  process.exit(1);
});
