import { readFile, writeFile, mkdir, copyFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public/brand");
const wordmark = JSON.parse(await readFile(new URL("./rebrand-assets-wordmark.json", import.meta.url), "utf8"));
const colors = { ink: "#0F2420", lime: "#CFF26A", petrol: "#0A7263", white: "#FFFFFF", paper: "#F5F8F3" };
const palettes = {
  "": [colors.lime, colors.ink, colors.petrol, colors.ink, colors.petrol],
  "-negatief": [colors.lime, colors.ink, colors.lime, colors.white, colors.lime],
  "-zwart": [colors.ink, colors.white, colors.ink, colors.ink, colors.ink],
  "-wit": [colors.white, colors.ink, colors.white, colors.white, colors.white],
};
const svg = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="BikeFitBoost">${content}</svg>`;
function badge(palette) {
  return `<circle cx="44" cy="22" r="24" fill="${palette[0]}"/><g fill="none" stroke="${palette[1]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 -2) rotate(-10 24 38)"><circle cx="24" cy="28" r="10"/><circle cx="56" cy="28" r="10"/><path d="M24 28H38L34 14H52L56 28M24 28L34 14M38 28L52 14M34 14V11M31 11H37M52 14l2-4h4"/><path stroke="${palette[2]}" d="M-2 18H11M-8 24H9M-2 30H11"/></g>`;
}
function lettering(palette, offset, baseline, scale = 1) {
  return `<g transform="translate(${offset} ${baseline}) scale(${scale})">${wordmark.parts.map((paths, index) => `<g fill="${palette[index + 3]}">${paths.map(({path: outline, offset: position}) => `<path transform="translate(${position}) scale(${wordmark.scale} ${-wordmark.scale})" d="${outline}"/>`).join("")}</g>`).join("")}</g>`;
}
function horizontal(palette) {
  return svg(344, 60, `<g transform="translate(10 8)">${badge(palette)}</g>${lettering(palette, 89, 43, 250 / wordmark.width)}`);
}
function stacked(palette) {
  return svg(344, 174, `<g transform="translate(95 16) scale(1.8)">${badge(palette)}</g>${lettering(palette, 27, 154, 290 / wordmark.width)}`);
}
const mark = (palette) => svg(84, 60, `<g transform="translate(10 8)">${badge(palette)}</g>`);
function favicon(stroke = 5) {
  return svg(64, 64, `<rect width="64" height="64" rx="16" fill="${colors.lime}"/><g fill="none" stroke-linecap="round" stroke-width="${stroke}" transform="rotate(-12 32 44)"><circle cx="28" cy="36" r="10" stroke="${colors.ink}"/><circle cx="50" cy="36" r="8" stroke="${colors.ink}"/><path d="M6 26H16M2 34H16M6 42H16" stroke="${colors.petrol}"/></g>`);
}
const appIcon = (maskable = false) => svg(512, 512, `<rect width="512" height="512" fill="${colors.ink}"/><g transform="translate(${maskable ? 128 : 64} ${maskable ? 160 : 136}) scale(${maskable ? 3.5 : 5.2})">${badge(palettes["-negatief"])}</g>`);
async function save(relative, content) {
  const destination = path.join(output, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, content);
}
async function png(relative, source, width, height) {
  await save(relative, await sharp(Buffer.from(source)).resize(width, height).png().toBuffer());
}
for (const [suffix, palette] of Object.entries(palettes)) {
  await save(`svg/logo-horizontaal${suffix}.svg`, horizontal(palette));
  await save(`svg/beeldmerk${suffix}.svg`, mark(palette));
  if (suffix === "" || suffix === "-negatief") {
    await save(`svg/logo-gestapeld${suffix}.svg`, stacked(palette));
    for (const width of [480, 960]) {
      await png(`png/logo-horizontaal${suffix}-${width}.png`, horizontal(palette), width);
      await png(`png/logo-gestapeld${suffix}-${width}.png`, stacked(palette), width);
    }
  }
}
for (const width of [256, 512, 1024]) await png(`png/beeldmerk-${width}.png`, mark(palettes[""]), width);
await png("png/avatar-1080.png", appIcon(), 1080, 1080);
await save("favicon/favicon.svg", favicon());
const icoImages = [];
for (const size of [16, 32, 48]) {
  const buffer = await sharp(Buffer.from(favicon(size === 16 ? 6 : size === 32 ? 5 : 4))).resize(size, size).png().toBuffer();
  icoImages.push(buffer);
  if (size !== 48) await save(`favicon/favicon-${size}.png`, buffer);
}
const icoHeader = Buffer.alloc(6 + 16 * icoImages.length);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(icoImages.length, 4);
let icoOffset = icoHeader.length;
for (const [index, buffer] of icoImages.entries()) {
  const entry = 6 + index * 16;
  icoHeader[entry] = [16, 32, 48][index];
  icoHeader[entry + 1] = icoHeader[entry];
  icoHeader.writeUInt16LE(1, entry + 4);
  icoHeader.writeUInt16LE(32, entry + 6);
  icoHeader.writeUInt32LE(buffer.length, entry + 8);
  icoHeader.writeUInt32LE(icoOffset, entry + 12);
  icoOffset += buffer.length;
}
await save("favicon/favicon.ico", Buffer.concat([icoHeader, ...icoImages]));
for (const [name, size] of [["apple-touch-icon", 180], ["android-chrome-192", 192], ["android-chrome-512", 512], ["maskable-512", 512]]) {
  await png(`favicon/${name}.png`, appIcon(name === "maskable-512"), size, size);
}
const manifest = {
  name: "BikeFitBoost", short_name: "BikeFitBoost", id: "/", start_url: "/", scope: "/", display: "standalone",
  background_color: colors.paper, theme_color: colors.ink,
  icons: [
    { src: "/android-chrome-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/android-chrome-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};
await save("favicon/site.webmanifest", JSON.stringify(manifest, null, 2) + "\n");
const og = svg(1200, 630, `<rect width="1200" height="630" fill="${colors.paper}"/><g transform="translate(118 231) scale(2.8)">${horizontal(palettes[""]).replace(/^<svg[^>]*>|<\/svg>$/g, "")}</g>`);
await save("social/og-image.svg", og);
await png("social/og-image-1200x630.png", og, 1200, 630);
for (const name of ["favicon.ico", "favicon.svg", "favicon-16.png", "favicon-32.png", "apple-touch-icon.png", "android-chrome-192.png", "android-chrome-512.png", "maskable-512.png", "site.webmanifest"]) {
  await copyFile(path.join(output, "favicon", name), path.join(root, "public", name));
}
await copyFile(path.join(output, "social/og-image-1200x630.png"), path.join(root, "public/og-image-1200x630.png"));
await copyFile(path.join(output, "social/og-image.svg"), path.join(root, "public/og-image.svg"));
await copyFile(path.join(output, "favicon/android-chrome-512.png"), path.join(root, "src/app/icon.png"));
await rm(path.join(root, "src/app/favicon.ico"), { force: true });
await sharp(Buffer.from(og)).jpeg({ quality: 95 }).toFile(path.join(root, "public/og/brand/social/og-image-1200x630.jpg"));
await save("report/report-logo.svg", horizontal(palettes[""]));
for (const [suffix, palette] of Object.entries(palettes)) {
  await save(`logo/logo-horizontaal${suffix}.svg`, horizontal(palette));
  await save(`logo/beeldmerk${suffix === "-negatief" ? "-donker" : suffix}.svg`, mark(palette));
  if (suffix === "" || suffix === "-negatief") {
    await save(`logo/logo-gestapeld${suffix}.svg`, stacked(palette));
    for (const width of [480, 960]) {
      for (const name of ["logo-horizontaal", "logo-gestapeld"]) {
        await copyFile(path.join(output, `png/${name}${suffix}-${width}.png`), path.join(output, `logo/${name}${suffix}-${width}.png`));
      }
    }
  }
}
for (const width of [256, 512, 1024]) {
  await copyFile(path.join(output, `png/beeldmerk-${width}.png`), path.join(output, `logo/beeldmerk-${width}.png`));
}
console.log("BikeFitBoost outlined logos, icons, manifest and social images generated.");
if (process.argv.includes("--preview")) {
  const layers = [];
  for (const [source, left, top, width, height] of [
    [horizontal(palettes[""]), 30, 40, 688, 120],
    [horizontal(palettes["-negatief"]), 30, 240, 688, 120],
    [horizontal(palettes["-zwart"]), 30, 440, 688, 120],
    [horizontal(palettes["-wit"]), 30, 640, 688, 120],
    [stacked(palettes[""]), 790, 20, 344, 174],
    [stacked(palettes["-negatief"]), 790, 220, 344, 174],
    [appIcon(), 800, 420, 180, 180],
    [appIcon(true), 1000, 420, 180, 180],
    [favicon(6), 800, 640, 16, 16],
    [favicon(5), 840, 640, 32, 32],
    [favicon(4), 900, 640, 48, 48],
    [horizontal(palettes[""]), 30, 830, 195, 34],
  ]) {
    layers.push({ input: await sharp(Buffer.from(source)).resize(width, height).png().toBuffer(), left, top });
  }
  const background = svg(1200, 900, `<rect width="1200" height="900" fill="${colors.paper}"/><path d="M0 200H1200V400H0ZM0 600H1200V800H0Z" fill="${colors.ink}"/>`);
  const directory = path.join(root, "plans/rebrand/renders");
  await mkdir(directory, { recursive: true });
  await sharp(Buffer.from(background)).composite(layers).png().toFile(path.join(directory, "B1-logo-contact.png"));
}
