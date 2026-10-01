import { readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import sharp from "sharp";

const sources = [
  ...(await readdir("public/illustrations/guides")).filter((file) => file.endsWith(".webp"))
    .map((file) => `/illustrations/guides/${file}`),
  ...(await readdir("public/guides/media")).filter((file) => /\.(png|webp|jpe?g)$/.test(file))
    .map((file) => `/guides/media/${file}`),
  "/brand/social/og-image-1200x630.png",
];
const manifest = {};
for (const source of sources) {
  const path = `/og${source.replace(/\.[^.]+$/, ".jpg")}`;
  await mkdir(dirname(`public${path}`), { recursive: true });
  const bytes = await sharp(`public${source}`).flatten({ background: "#F5F8F3" })
    .resize(1200, 630, { fit: "contain", background: "#F5F8F3" })
    .jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (bytes.length > 200000) throw new Error(`Social image exceeds budget: ${source}`);
  await writeFile(`public${path}`, bytes);
  manifest[source] = { path, width: 1200, height: 630, bytes: bytes.length };
}
await writeFile("src/lib/seo/social-images.json", JSON.stringify(manifest, null, 2)+"\n");
console.log(`Generated ${sources.length} dedicated 1200×630 JPEG social images.`);
