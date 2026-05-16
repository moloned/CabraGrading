import path from 'node:path';
import fs from 'node:fs/promises';
import { Jimp } from 'jimp';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'clean');
const TOLERANCE = 34;

const INPUTS = [
  'CabraLogo.png',
  'IJA-logo.png',
  'JudoMonkey.png',
  'Shamrock123.png',
  'Mon4.png',
  'Mon5.png',
  'Mon6.png',
  'Mon7.png',
  'Mon8.png',
  'Mon9.png',
  'Mon10.png',
  'src/assets/hero.png'
];

const dist = (r1, g1, b1, r2, g2, b2) => Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

function rgbaAt(data, idx) {
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
}

function removeBackgroundByEdgeFlood(image) {
  const { width, height, data } = image.bitmap;

  const corners = [
    0,
    ((width - 1) * 4),
    ((height - 1) * width * 4),
    ((height * width - 1) * 4)
  ];

  let bgR = 0;
  let bgG = 0;
  let bgB = 0;

  for (const idx of corners) {
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }

  bgR = Math.round(bgR / corners.length);
  bgG = Math.round(bgG / corners.length);
  bgB = Math.round(bgB / corners.length);

  const visited = new Uint8Array(width * height);
  const queue = [];

  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    const idx = pos * 4;
    const [r, g, b, a] = rgbaAt(data, idx);
    if (a === 0) return;
    if (dist(r, g, b, bgR, bgG, bgB) > TOLERANCE) return;
    visited[pos] = 1;
    queue.push(pos);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const pos = queue.shift();
    const idx = pos * 4;
    data[idx + 3] = 0;

    const x = pos % width;
    const y = Math.floor(pos / width);
    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }
}

await fs.mkdir(OUT_DIR, { recursive: true });

for (const rel of INPUTS) {
  const inPath = path.join(ROOT, rel);
  try {
    await fs.access(inPath);
  } catch {
    console.log(`skip: ${rel} (missing)`);
    continue;
  }

  const image = await Jimp.read(inPath);
  removeBackgroundByEdgeFlood(image);

  const base = path.basename(rel, path.extname(rel));
  const outPath = path.join(OUT_DIR, `${base}-nobg.png`);
  await image.write(outPath);
  console.log(`wrote: ${path.relative(ROOT, outPath)}`);
}
