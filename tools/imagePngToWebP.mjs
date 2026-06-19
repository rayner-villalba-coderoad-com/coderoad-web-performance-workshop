/**
 * WebP Converter
 * Fundamentals of Web Performance
 *
 * Build tool to convert the optimized PNGs in the `min` directory
 * into WebP files, placed in the `webp` directory.
 *
 * @see https://sharp.pixelplumbing.com/
 */

import { parse } from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { glob } from 'glob';

console.log('Converting to WebP Images');

const filePaths = await glob([
  'public/assets/img/min/**/*.png',
  'public/assets/img/*.png',
]);

await mkdir('public/assets/img/webp', { recursive: true });

await Promise.all(
  filePaths.map((path) =>
    sharp(path)
      .webp({ quality: 50 })
      .toFile(`public/assets/img/webp/${parse(path).name}.webp`)
  )
);
