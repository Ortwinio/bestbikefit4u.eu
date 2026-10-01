import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { buildSourceIndex, locateFinding, ownerForSource } from "./nl-source-map.mjs";

test("maps observed literals to source lines, preferring NL scope and actual route dependencies", async () => {
  const root = await mkdtemp(join(tmpdir(), "nl-source-map-"));
  try {
    const sources = {
      "src/app/(dashboard)/bikes/new/page.tsx":
        'import { copy } from "@/i18n/account/bikes";\nexport default () => <p>{copy.label}</p>;\n',
      "src/i18n/account/bikes.ts":
        'const en = { label: "Save your bike" };\nconst nl = { label: "Save your bike" };\nexport const copy = nl;\n',
      "src/i18n/marketing/other.ts": 'const nl = { label: "Save your bike" };\n',
      "src/components/ui/Input.tsx": 'export default () => <input placeholder="Enter a value" />;\n',
    };
    for (const [file, contents] of Object.entries(sources)) {
      await mkdir(join(root, file, ".."), { recursive: true });
      await writeFile(join(root, file), contents);
    }
    const index = await buildSourceIndex(root);
    const result = locateFinding(index, { text: "Save your bike", route: "/nl/bikes/new" });
    assert.equal(result.owner, "D");
    assert.equal(result.confidence, "exact");
    assert.equal(result.needsConfirmation, false);
    assert.deepEqual(result.locations, [{ file: "src/i18n/account/bikes.ts", line: 2,
      confidence: "exact", locale: "nl", owner: "D" }]);
    const ui = locateFinding(index, { text: "Enter a value", route: "/nl/bikes/new" });
    assert.equal(ui.owner, "C", "shared UI ownership must not inherit the bike route owner");
    const fallback = locateFinding(index, { text: "Unmapped generated message", route: "/nl/bikes/new" });
    assert.equal(fallback.confidence, "route-fallback");
    assert.equal(fallback.needsConfirmation, true);
    assert.equal(fallback.locations[0].file, "src/app/(dashboard)/bikes/new/page.tsx");
    assert.equal(fallback.locations[0].line, 1);
    assert.match(fallback.reason, /not the proven text origin/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("uses lead ownership for shared components, guides, account PDF, bikes, and science", () => {
  const cases = [
    ["src/lib/guides/content/setup-parameters.ts", "A"],
    ["src/components/layout/Header.tsx", "A"],
    ["src/i18n/account/dashboardReport.ts", "B"],
    ["src/lib/pdf/report.ts", "B"],
    ["src/components/ui/Input.tsx", "C"],
    ["src/lib/seo/programmatic/tirePressure.ts", "C"],
    ["src/i18n/calculators/fuelHydration.ts", "C"],
    ["src/i18n/account/bikesPreview.ts", "D"],
    ["src/components/science/Article.tsx", "D"],
  ];
  for (const [file, expected] of cases) assert.equal(ownerForSource(file), expected, file);
  assert.equal(ownerForSource("src/i18n/messages/nl.ts", "/bikes"), "D");
  assert.equal(ownerForSource("src/components/layout/Header.tsx", "/bikes"), "A");
});

test("maps generated UI labels to their actual shared source, never to email address substrings", () => {
  const index = { files: ["src/app/(dashboard)/bikes/page.tsx"], imports: new Map(), entries: [
    { file: "src/config/brand.ts", line: 6, value: "brand <noreply@notifications.example.com>" },
    { file: "src/components/prototyper-ui/ui/numberfield.tsx", line: 101, value: "increase" },
    { file: "src/components/prototyper-ui/ui/numberfield.tsx", line: 102, value: "decrease" },
  ], defaultBindings: [{ value: "notifications", file: "src/components/ui/Toast.tsx", line: 221,
    dependencyFile: "node_modules/@base-ui/react/toast/viewport/ToastViewport.js", dependencyLine: 221 }] };
  const toast = locateFinding(index, { text: "Notifications", route: "/bikes", kind: "aria-label" });
  assert.equal(toast.owner, "C");
  assert.equal(toast.confidence, "dependency-default");
  assert.equal(toast.locations[0].file, "src/components/ui/Toast.tsx");
  for (const [prefix, line] of [["Increase", 101], ["Decrease", 102]]) {
    const result = locateFinding(index, { text: `${prefix} Fietsgewicht (kg)`, route: "/bikes", kind: "aria-label" });
    assert.equal(result.owner, "C");
    assert.equal(result.confidence, "generated-prefix");
    assert.equal(result.locations[0].line, line);
  }
  const noProvider = locateFinding({ ...index, defaultBindings: [] }, {
    text: "Notifications", route: "/bikes", kind: "aria-label",
  });
  assert.equal(noProvider.confidence, "route-fallback");
  assert.equal(ownerForSource("src/app/(public)/fit-pass/page.tsx", "/fit-pass"), "A");
});
