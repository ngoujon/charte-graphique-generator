import fs from 'fs/promises';
import path from 'path';

export async function listFilesInDir(dir, filter = () => true) {
  await fs.mkdir(dir, { recursive: true });
  const files = await fs.readdir(dir);
  const details = await Promise.all(
    files
      .filter((f) => !f.startsWith('.') && filter(f))
      .map(async (name) => {
        const stat = await fs.stat(path.join(dir, name));
        return { name, size: stat.size, modified: stat.mtime };
      })
  );
  return details;
}
