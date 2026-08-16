import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const root = new URL("../dist/", import.meta.url).pathname;
const textExtensions = new Set([".js", ".mjs", ".css", ".html", ".json"]);

async function filesUnder(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) files.push(...await filesUnder(path));
    else files.push(path);
  }
  return files;
}

const initialFiles = await filesUnder(root);
const pngFiles = initialFiles.filter((path) =>
  extname(path).toLowerCase() === ".png" && basename(path) !== "failfirst-game-qr.png"
);

for (const input of pngFiles) {
  const output = input.replace(/\.png$/i, ".webp");
  await sharp(input).webp({ quality: 82, effort: 5, alphaQuality: 90 }).toFile(output);
  await unlink(input);
}

for (const path of await filesUnder(root)) {
  if (!textExtensions.has(extname(path).toLowerCase())) continue;
  const source = await readFile(path, "utf8");
  const updated = source.replaceAll(".png", ".webp");
  if (updated !== source) await writeFile(path, updated);
}

console.log(`Optimized ${pngFiles.length} deployment images to WebP.`);
