import fs from 'fs/promises';
import path from 'path';
import { getDataDir } from '../dataDir.js';

const DAY_MS = 24 * 60 * 60 * 1000;

// Rétention par défaut : 90 jours pour les PDF générés, 14 jours pour la corbeille.
const OUTPUT_RETENTION_DAYS = Number(process.env.OUTPUT_RETENTION_DAYS || 90);
const TRASH_RETENTION_DAYS = Number(process.env.TRASH_RETENTION_DAYS || 14);
const PURGE_INTERVAL_MS = 6 * 60 * 60 * 1000; // vérifie toutes les 6h

async function purgeDir(dir, maxAgeDays) {
  if (!maxAgeDays || maxAgeDays <= 0) return 0;
  const cutoff = Date.now() - maxAgeDays * DAY_MS;
  let removed = 0;
  const files = await fs.readdir(dir).catch(() => []);
  for (const name of files) {
    if (!name.endsWith('.pdf')) continue;
    const filePath = path.join(dir, name);
    try {
      const stat = await fs.stat(filePath);
      if (stat.mtimeMs < cutoff) {
        await fs.unlink(filePath);
        removed++;
      }
    } catch (err) {
      console.warn('[purge] impossible de traiter', filePath, err.message);
    }
  }
  return removed;
}

export async function runPurge() {
  const dataDir = getDataDir();
  const removedOutput = await purgeDir(path.join(dataDir, 'output'), OUTPUT_RETENTION_DAYS);
  const removedTrash = await purgeDir(path.join(dataDir, 'trash'), TRASH_RETENTION_DAYS);
  if (removedOutput || removedTrash) {
    console.log(`[purge] ${removedOutput} fichier(s) de sortie et ${removedTrash} fichier(s) de corbeille supprimés (rétention dépassée).`);
  }
}

export function scheduleAutoPurge() {
  runPurge().catch((err) => console.error('[purge] erreur au démarrage:', err));
  setInterval(() => {
    runPurge().catch((err) => console.error('[purge] erreur:', err));
  }, PURGE_INTERVAL_MS);
}
