import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const MAX_SIDE = 1800;

/**
 * Charge une image pour le PDF : convertit SVG / WebP en PNG (react-pdf ne gère
 * que PNG et JPEG), réduit les très grandes images et renvoie un data URI
 * accompagné des dimensions (utile pour respecter les proportions).
 */
export async function loadImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const input = await fs.readFile(filePath);
  const isSvg = ext === '.svg';
  let pipeline = sharp(input, isSvg ? { density: 300 } : {}).rotate();
  const meta = await pipeline.metadata();
  const tooBig = (meta.width || 0) > MAX_SIDE || (meta.height || 0) > MAX_SIDE;
  if (tooBig) pipeline = pipeline.resize(MAX_SIDE, MAX_SIDE, { fit: 'inside', withoutEnlargement: true });

  const keepJpeg = (ext === '.jpg' || ext === '.jpeg') && !meta.hasAlpha;
  const { data, info } = keepJpeg
    ? await pipeline.jpeg({ quality: 88 }).toBuffer({ resolveWithObject: true })
    : await pipeline.png({ compressionLevel: 9 }).toBuffer({ resolveWithObject: true });

  return {
    src: `data:image/${keepJpeg ? 'jpeg' : 'png'};base64,${data.toString('base64')}`,
    width: info.width,
    height: info.height,
    name: path.basename(filePath),
  };
}

/** Nom lisible d'un fichier importé (sans suffixe d'horodatage ni extension). */
export function prettyImageName(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/-\d{10,}(-\d+)?$/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}
