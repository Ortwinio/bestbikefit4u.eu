import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const destination = resolve(root, "public/email");
await mkdir(destination, { recursive: true });

// Reuse the current brand artwork, preserving its proportions in the exact 2x canvas.
await sharp(resolve(root, "public/brand/logo/logo-horizontaal.svg"), { density: 288 })
  .resize(358, 60, { fit: "contain", background: "#ffffff" })
  .png({ palette: true, colours: 128, compressionLevel: 9 })
  .toFile(resolve(destination, "logo.png"));

// Email clients need PNGs; these are existing in-house pen drawings, not new artwork.
const illustrations = {
  "measuring-kit": "06-meetset.webp",
  tyre: "04-bandenspanning.webp",
  "stack-reach": "08-stack-en-reach.webp",
};
for (const [name, source] of Object.entries(illustrations)) {
  await sharp(resolve(root, "public/illustrations", source))
    .resize(960, 720, { fit: "inside", withoutEnlargement: true })
    .png({ palette: true, colours: 128, dither: 0.25, compressionLevel: 9 })
    .toFile(resolve(destination, `${name}.png`));
}

// Small code-native line icons: viewBox 24, stroke 2, rasterized at 2x.
const icons = {
  check: '<path d="m5 12 4 4L19 6"/>',
  report: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>'
    + '<path d="M14 3v6h6M8 13h8M8 17h5"/>',
  bike: '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/>'
    + '<path d="m5 17 5-9 5 9H5m5-9h7l2 9M8 5h4m3-2h2l2 5"/>',
  plan: '<path d="M9 6h11M9 12h11M9 18h11M3 5l1 1 2-2M3 11l1 1 2-2M3 17l1 1 2-2"/>',
  tip: '<path d="M9 18h6m-6 3h6m-6-6c0-2-3-3-3-6a6 6 0 0 1 12 0c0 3-3 4-3 6z"/>',
};
for (const [name, drawing] of Object.entries(icons)) {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"'
    + ' fill="none" stroke="#0A7263" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + drawing + '</svg>';
  await sharp(Buffer.from(svg)).png({ palette: true, compressionLevel: 9 })
    .toFile(resolve(destination, `icon-${name}.png`));
}
