/**
 * PNG Optimizer
 * Fundamentals of Web Performance
 *
 * Build tool to optimize the PNG images and place them in the `min` directory.
 *
 * If images have already been resized, the responsive images will be optimized
 * as well.
 *
 * @see https://sharp.pixelplumbing.com/
 */

import { parse } from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { glob } from 'glob';

console.log('Optimizing PNG Images');

const filePaths = await glob('public/assets/img/**/*.png', {
  ignore: 'public/assets/img/min/**',
});

await mkdir('public/assets/img/min', { recursive: true });

await Promise.all(
  filePaths.map((path) =>
    sharp(path)
      // `quality` + `palette` mirror pngquant's lossy quantization (0.6–0.8).
      .png({ quality: 80, palette: true, compressionLevel: 9 })
      .toFile(`public/assets/img/min/${parse(path).base}`)
  )
);
