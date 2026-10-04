import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { test } from "node:test";
import sharp from "sharp";

const asset = (name) => new URL(`../public/brand/${name}`, import.meta.url);
test("all required logo variants are outlined, and preserve the chosen badge geometry", async () => {
  for (const name of [
    "logo-horizontaal", "logo-horizontaal-negatief", "logo-horizontaal-zwart", "logo-horizontaal-wit",
    "logo-gestapeld", "logo-gestapeld-negatief", "beeldmerk", "beeldmerk-negatief", "beeldmerk-zwart", "beeldmerk-wit",
  ]) {
    const source = await readFile(asset(`svg/${name}.svg`), "utf8");
    assert.doesNotMatch(source, /<text|font-family|BestBikeFit4U/i);
    assert.match(source, /rotate\(-10 24 38\)/);
    assert.match(source, /M-2 18H11M-8 24H9M-2 30H11/);
    if (name.startsWith("logo-")) assert.match(source, /scale\(0\.04 -0\.04\)/);
  }
});
test("installable icons and root aliases have correct dimensions", async () => {
  for (const [name, size] of [["apple-touch-icon", 180], ["android-chrome-192", 192], ["android-chrome-512", 512], ["maskable-512", 512]]) {
    const buffer = await readFile(asset(`favicon/${name}.png`));
    const metadata = await sharp(buffer).metadata();
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
    assert.deepEqual(await readFile(new URL(`../public/${name}.png`, import.meta.url)), buffer);
  }
  const manifest = JSON.parse(await readFile(asset("favicon/site.webmanifest"), "utf8"));
  assert.equal(manifest.name, "BikeFitBoost");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.theme_color, "#0F2420");
  assert.equal(manifest.icons.find((icon) => icon.purpose === "maskable").sizes, "512x512");
});
test("favicon contains 16, 32 and 48 pixel images and OG is 1200×630", async () => {
  const ico = await readFile(asset("favicon/favicon.ico"));
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  assert.deepEqual([ico[6], ico[22], ico[38]], [16, 32, 48]);
  const og = await sharp(await readFile(asset("social/og-image-1200x630.png"))).metadata();
  assert.equal(og.width, 1200);
  assert.equal(og.height, 630);
  const oldUrl = await sharp(await readFile(new URL("../public/og/brand/social/og-image-1200x630.jpg", import.meta.url))).metadata();
  assert.equal(oldUrl.width, 1200);
  assert.equal(oldUrl.height, 630);
  await assert.rejects(access(new URL("../src/app/favicon.ico", import.meta.url)));
  assert.deepEqual(
    await readFile(new URL("../src/app/icon.png", import.meta.url)),
    await readFile(asset("favicon/android-chrome-512.png")),
  );
});
