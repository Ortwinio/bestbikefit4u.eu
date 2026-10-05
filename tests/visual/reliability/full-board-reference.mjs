import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import vm from "node:vm";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const folder = resolve(root, "plans/reliability/boards/project");
const output = resolve(root, "plans/reliability/renders/F3-board-reference.json");

export function executeBoard(html, { props = {}, state = {} } = {}) {
  const match = html.match(/<script\b([^>]*\bdata-dc-script\b[^>]*)>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("Missing board script");
  const definitions = JSON.parse(match[1].match(/data-props='([^']*)'/)?.[1] ?? "{}");
  const defaults = Object.fromEntries(Object.entries(definitions).filter(([key]) => !key.startsWith("$"))
    .map(([key, value]) => [key, value.default]));
  class DCLogic {
    constructor(values) { this.props = values; this.state = {}; }
    setState(values) { this.state = { ...this.state, ...values }; }
  }
  const context = vm.createContext({ DCLogic, props: { ...defaults, ...props }, state });
  const result = vm.runInContext(`${match[2]}\nconst component = new Component(props); component.setState(state); component.renderVals();`, context, { timeout: 1000 });
  return JSON.parse(JSON.stringify(result, (_key, value) => typeof value === "function" ? "[interaction]" : value));
}

export async function collectBoardReferences() {
  const results = [];
  const template = await readFile(resolve(folder, "Calculator.dc.html"), "utf8");
  for (const filename of (await readdir(folder)).filter(name => name.endsWith(".dc.html")).sort()) {
    const html = await readFile(resolve(folder, filename), "utf8");
    const importedCalculator = html.match(/<dc-import\s+name="Calculator"\s+calc="([^"]+)"/)?.[1];
    const source = importedCalculator ? template : html;
    const props = importedCalculator ? { calc: importedCalculator } : {};
    const cases = [{ name: "default", state: {} }];
    if (importedCalculator) cases.push({ name: "second-step", state: { done2: true } });
    if (filename === "Account.dc.html") cases.push(
      { name: "three-consistent", state: { meas: [89, 89, 89] } },
      { name: "spread-over-5mm", state: { meas: [89, 90, 89] } });
    if (filename === "Betaald.dc.html") cases.push(
      { name: "below-window", state: { angle: 20 } }, { name: "above-window", state: { angle: 40 } });
    if (filename === "Main.dc.html") cases.push(
      { name: "measured", state: { hasInseam: true } },
      { name: "check-unconfirmed", state: { hasInseam: true, inseam: 95 } },
      { name: "large-override", state: { hasInseam: true, inseam: 103, override: true } });
    results.push({ filename, importedCalculator, states: cases.map(item => ({ state: item.name, values: executeBoard(source, { props, state: item.state }) })) });
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = await collectBoardReferences();
  await mkdir(resolve(root, "plans/reliability/renders"), { recursive: true });
  await writeFile(output, JSON.stringify({ scope: "Board scripts executed in an isolated DCLogic shim; no canvas rendering or network.",
    discrepancies: ["Main yellow warning uses measured sigma before confirmation; the written model requires unresolved-warning sigma.",
      "Calculator and overview contain provisional per-calculator widths; ontwerp section 9 wins where they differ.",
      "Static board fixture centres are not substitutes for production engine results."], results }, null, 2));
  console.log(JSON.stringify({ boards: results.length, states: results.reduce((count, board) => count + board.states.length, 0), output }));
}
