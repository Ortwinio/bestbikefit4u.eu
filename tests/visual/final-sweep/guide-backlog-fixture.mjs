import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** Preserve real guide labels in browser fixtures; replace only server-side CSV file access. */
export function guideBacklogFixture(root) {
  return {
    name: "snapshot-guide-csv",
    setup(builder) {
      builder.onLoad({ filter: /[/\\]src[/\\]lib[/\\]guides[/\\]backlog\.ts$/ }, async ({ path }) => {
        const source = await readFile(path, "utf8");
        const csv = Object.fromEntries(await Promise.all(["nl", "en"].map(async (locale) => [locale,
          await readFile(resolve(root, `docs/bestbikefit4u_guides_cms_backlog_v1_${locale}.csv`), "utf8"),
        ])));
        const call = 'readFileSync(getCsvPath(locale), "utf8")';
        if (!source.includes(call)) throw new Error("Guide CSV fixture adaptation needs updating");
        const contents = `const __snapshotGuideCsv = ${JSON.stringify(csv)};\n` + source
          .replace(/^import .* from "node:(?:fs|path)";\n/gm, "")
          .replace(/function getCsvPath\(locale: Locale\) \{[\s\S]*?\n\}\n/, "")
          .replace(call, "__snapshotGuideCsv[locale]");
        return { contents, loader: "ts", resolveDir: resolve(root, "src/lib/guides") };
      });
    },
  };
}
