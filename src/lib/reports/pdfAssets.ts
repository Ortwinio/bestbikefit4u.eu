import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PdfReportAssets } from "./pdfShared";

let cached: { images: PdfReportAssets; fontCss: string } | undefined;

/** Fixed bundled paths only: never read a caller-provided filename or fetch a font at render time. */
export function getPdfReportAssets() {
  if (cached) return cached;
  const embed = (relative: string, mime: string) =>
    `data:${mime};base64,${readFileSync(join(process.cwd(), "public", relative)).toString("base64")}`;
  cached = {
    images: {
      logo: embed("brand/report/report-logo.svg", "image/svg+xml"),
      bikeDimensions: embed("brand/report/bike-dimensions.png", "image/png"),
      pressure: embed("illustrations/04-bandenspanning.webp", "image/webp"),
      measureSet: embed("illustrations/06-meetset.webp", "image/webp"),
      stackReach: embed("illustrations/08-stack-en-reach.webp", "image/webp"),
    },
    fontCss: [
      ["Bricolage Grotesque", "bricolage-grotesque-600-latin.woff2", "600"],
      ["Bricolage Grotesque", "bricolage-grotesque-700-latin.woff2", "700"],
      ["Bricolage Grotesque", "bricolage-grotesque-800-latin.woff2", "800"],
      ["Figtree", "figtree-400-latin.woff2", "400"],
      ["Figtree", "figtree-500-latin.woff2", "500"],
      ["Figtree", "figtree-600-latin.woff2", "600"],
      ["Figtree", "figtree-700-latin.woff2", "700"],
      ["Figtree", "figtree-800-latin.woff2", "800"],
      ["DM Mono", "dm-mono-latin.woff2", "500"],
    ]
      .map(
        ([family, file, weight]) => `@font-face {
      font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: block;
      src: url('${embed(`brand/report/fonts/${file}`, "font/woff2")}') format('woff2');
    }`,
      )
      .join("\n"),
  };
  return cached;
}
