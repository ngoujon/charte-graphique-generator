import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { inputRouter } from './routes/input.js';
import { outputRouter } from './routes/output.js';
import { confRouter } from './routes/conf.js';
import { generateRouter } from './routes/generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3002;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', '..', 'data');

export const getDataDir = () => DATA_DIR;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const publicDir = path.join(__dirname, '..', 'public');
const hasPublic = await fs.access(publicDir).then(() => true).catch(() => false);

if (hasPublic) {
  app.use(express.static(publicDir));
}

// API routes
app.use('/api/input', inputRouter);
app.use('/api/output', outputRouter);
app.use('/api/conf', confRouter);
app.use('/api/generate', generateRouter);

if (hasPublic) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Charte Graphique Generator running on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
