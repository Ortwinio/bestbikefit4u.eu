import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { buildSiteManifest } from "./siteManifest";

it.each(["nl", "en"] as const)("provides installable %s manifest fields and real PNG icons", (locale) => {
  const manifest = buildSiteManifest(locale);
  expect(manifest).toMatchObject({
    id: "/", start_url: `/${locale}`, scope: "/", display: "standalone", lang: locale,
  });
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ sizes: "192x192", type: "image/png" }),
    expect.objectContaining({ sizes: "512x512", type: "image/png" }),
    expect.objectContaining({ sizes: "512x512", purpose: "maskable" }),
  ]));
  for (const icon of manifest.icons ?? []) {
    const bytes = readFileSync(resolve("public", icon.src.slice(1)));
    expect(bytes.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`).toBe(icon.sizes);
  }
});
