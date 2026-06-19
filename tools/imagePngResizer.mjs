/**
 * PNG Resizer
 * Fundamentals of Web Performance
 *
 * Build tool to generate responsive sizes for all the images on the site and
 * put them in the `r` directory.
 * @see https://sharp.pixelplumbing.com/
 */

import { parse } from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import { glob } from 'glob';

const filePaths = await glob('public/assets/img/*.png');
const widths = [360, 720, 1024, 1400, 2800];

console.log('Generating Responsive Images');

await mkdir('public/assets/img/r', { recursive: true });

await Promise.all(
  filePaths.flatMap((path) => {
    const sourcePath = parse(path);
    return widths.map((width) =>
      sharp(path)
        .resize({ width })
        .toFile(`public/assets/img/r/${sourcePath.name}-${width}${sourcePath.ext}`)
    );
  })
);
