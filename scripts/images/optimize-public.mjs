import { readdir, readFile, writeFile, mkdir, copyFile, rename, unlink, stat } from "node:fs/promises";
import { dirname, extname } from "node:path";
import sharp from "sharp";

const archive = "plans/redesign-canvas/illustration-sources/originals";
const entries = await readdir("public", { recursive: true });
const optimized = [];
const replacements = {};
const unused = new Set(["bike-terrain.png", "climbing-cyclist.png", "cyclist.png", "type-of-riding.png",
  "profile-complete.png", "mascote/bestbikefit4u-mascote-on-bike.png", "mascote/bestbikefit4u-mascote.png",
  "logo/bestbikefit4u-logo-cropped.png"]);
const sources = new Set(["clock.png", "riding-position.png", "comfort-discomfort.png",
  "bestbikefit4u-beginner-intermediate-advanced.png", "mascote/bestbikefit4u-mascote-on-bike-transparent.png",
  ...entries.filter((name) => /^measure\/.*-bbf4u\.png$/.test(name))]);
for (const name of entries) {
  const path = `public/${name}`;
  if (!(await stat(path)).isFile()) continue;
  const original = await readFile(path);
  if (unused.has(name) || name === "bestbikefit4u-home.gif" || sources.has(name) ||
      (extname(name) === ".png" && original.length > 300000)) {
    await mkdir(dirname(`${archive}/${name}`), { recursive: true });
    await copyFile(path, `${archive}/${name}`, 1).catch((error) => { if (error.code !== "EEXIST") throw error; });
    if (unused.has(name)) { await unlink(path); continue; }
    if (name === "bestbikefit4u-home.gif") { await rename(path, `${archive}/${name}`); continue; }
    const output = sources.has(name) ? name.replace(/\.png$/, ".webp") : name;
    const width = name.startsWith("mascote/") ? 768 : name.startsWith("measure/") ? 1000 : 1400;
    let bytes;
    for (const quality of [86, 78, 68, 58]) {
      const pipeline = sharp(original).resize({ width, withoutEnlargement: true });
      bytes = sources.has(name) ? await pipeline.webp({ quality, effort: 6 }).toBuffer()
        : await pipeline.png({ palette: true, quality, colours: 128, effort: 10 }).toBuffer();
      if (bytes.length <= 250000) break;
    }
    if (bytes.length > 250000 && sources.has(name)) {
      bytes = await sharp(original).resize({ width: 1000, withoutEnlargement: true })
        .webp({ quality: 72, effort: 6 }).toBuffer();
    }
    if (bytes.length > 250000) throw new Error(`Cannot meet image budget: ${name}`);
    await writeFile(`public/${output}`, bytes);
    if (output !== name) { replacements[`/${name}`] = `/${output}`; await unlink(path); }
    optimized.push({ original: name, output, before: original.length, after: bytes.length, width });
  }
}
await writeFile("plans/redesign-canvas/audit/47-optimized.json", JSON.stringify(optimized, null, 2)+"\n");
await writeFile("plans/redesign-canvas/audit/47-replacements.json", JSON.stringify(replacements, null, 2)+"\n");
console.log(`Optimized ${optimized.length} sources; archived originals outside public.`);
