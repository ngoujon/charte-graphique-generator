import express from 'express';
import cors from 'cors';
import path from 'path';
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

// Static files (built React app)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/input', inputRouter);
app.use('/api/output', outputRouter);
app.use('/api/conf', confRouter);
app.use('/api/generate', generateRouter);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Charte Graphique Generator running on http://localhost:${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
});
