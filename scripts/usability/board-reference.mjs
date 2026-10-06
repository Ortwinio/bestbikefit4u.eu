import { readFile, readdir, mkdir, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, dirname, relative, resolve } from "node:path";
import vm from "node:vm";
import { JSDOM } from "jsdom";

const root = fileURLToPath(new URL("../../", import.meta.url));
const folder = resolve(root, "plans/usability/canvas/project");
const output = resolve(root, "plans/usability/renders/U1-board-reference.json");

function serializable(value) {
  return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === "function" ? "[interaction]" : item));
}

export function executeBoard(html, { props = {}, state = {}, interactions = [] } = {}) {
  const document = new JSDOM(html).window.document;
  const script = document.querySelector("script[data-dc-script]");
  if (!script) return { status: "static", values: {}, snapshots: [] };
  const definitions = JSON.parse(script.getAttribute("data-props") ?? "{}");
  const defaults = Object.fromEntries(Object.entries(definitions).filter(([key]) => !key.startsWith("$"))
    .map(([key, value]) => [key, value.default]));
  class DCLogic {
    constructor(values) { this.props = values; this.state = {}; }
    setState(values) { this.state = { ...this.state, ...values }; }
  }
  const context = vm.createContext({ DCLogic, props: { ...defaults, ...props }, state });
  vm.runInContext(`${script.textContent}\nconst component = new Component(props); component.setState(state);`, context, { timeout: 1000 });
  const snapshots = [{ name: "default", values: serializable(vm.runInContext("component.renderVals()", context, { timeout: 1000 })) }];
  for (const interaction of interactions) {
    context.interaction = interaction;
    vm.runInContext("component.renderVals()[interaction.name](interaction.event)", context, { timeout: 1000 });
    snapshots.push({ name: interaction.label ?? interaction.name, values: serializable(vm.runInContext("component.renderVals()", context, { timeout: 1000 })) });
  }
  return { status: "executed", defaults, values: snapshots.at(-1).values, snapshots };
}

export function resolveImportProps(element, values) {
  const props = {};
  for (const attribute of element.attributes) {
    if (attribute.name === "name" || attribute.name.startsWith("hint-")) continue;
    const key = attribute.name.replace(/-([a-z])/g, (_match, letter) => letter.toUpperCase());
    const expression = attribute.value.match(/^\{\{([\s\S]*)\}\}$/);
    props[key] = expression
      ? vm.runInNewContext(expression[1], { ...values }, { timeout: 1000 })
      : attribute.value;
  }
  return props;
}

export function importScopes(element, values) {
  const ancestors = [];
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (["SC-FOR", "SC-IF"].includes(parent.tagName)) ancestors.unshift(parent);
  }
  let scopes = [values];
  for (const ancestor of ancestors) {
    const expression = (ancestor.getAttribute(ancestor.tagName === "SC-FOR" ? "list" : "value") ?? "").replace(/^\{\{|\}\}$/g, "");
    scopes = scopes.flatMap(scope => {
      const result = vm.runInNewContext(expression, { ...scope }, { timeout: 1000 });
      return ancestor.tagName === "SC-IF" ? (result ? [scope] : [])
        : result.map(item => ({ ...scope, [ancestor.getAttribute("as")]: item }));
    });
  }
  return scopes;
}

async function filesWithin(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map(entry => entry.isDirectory()
    ? filesWithin(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return groups.flat().filter(filename => filename.endsWith(".dc.html")).sort();
}

export async function collectBoardReferences() {
  const files = await filesWithin(folder);
  const sources = new Map(await Promise.all(files.map(async filename => [filename, await readFile(filename, "utf8")])));
  const results = [];
  for (const [filename, html] of sources) {
    const name = relative(folder, filename);
    const document = new JSDOM(html).window.document;
    const externalScripts = await Promise.all(Array.from(document.querySelectorAll("script[src]")).map(async element => {
      const src = element.getAttribute("src");
      let available = false;
      try { await access(resolve(dirname(filename), src)); available = true; } catch {}
      return { src, available, executed: false };
    }));
    let execution;
    try {
      const interactions = ["Main.dc.html", "m/Home.dc.html"].includes(name)
        ? [150, 190, 205].map(height => ({ name: "setHeight", label: `height-${height}`, event: { target: { value: String(height) } } })) : [];
      execution = executeBoard(html, { interactions });
    } catch (error) { execution = { status: "unsupported", error: error.message, values: {} }; }
    const imports = [];
    for (const element of document.querySelectorAll("dc-import")) {
      const importedName = element.getAttribute("name");
      const localFile = resolve(dirname(filename), `${importedName}.dc.html`);
      const importedFile = sources.has(localFile) ? localFile : files.find(candidate => basename(candidate) === `${importedName}.dc.html`);
      if (!importedFile) { imports.push({ name: importedName, status: "missing" }); continue; }
      try {
        const scopes = importScopes(element, execution.snapshots?.[0]?.values ?? execution.values);
        if (!scopes.length) imports.push({ name: importedName, status: "inactive-default" });
        for (const scope of scopes) {
          const props = resolveImportProps(element, scope);
          imports.push({ name: importedName, file: relative(folder, importedFile), props, ...executeBoard(sources.get(importedFile), { props }) });
        }
      } catch (error) { imports.push({ name: importedName, status: "unsupported", error: error.message }); }
    }
    results.push({ filename: name, externalScripts, ...execution, imports });
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = await collectBoardReferences();
  const summary = {
    boards: results.length,
    executed: results.filter(result => result.status === "executed").length,
    static: results.filter(result => result.status === "static").length,
    unsupported: results.filter(result => result.status === "unsupported").map(result => ({ filename: result.filename, error: result.error })),
    imports: results.flatMap(result => result.imports).length,
    unsupportedImports: results.flatMap(result => result.imports.filter(item => !["executed", "static", "inactive-default"].includes(item.status)).map(item => ({ filename: result.filename, ...item }))),
    missingExternalScripts: results.flatMap(result => result.externalScripts.filter(script => !script.available).map(script => ({ filename: result.filename, src: script.src }))),
  };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ scope: "Board default logic and direct imported props executed in a DCLogic VM shim; homepage slider handlers sampled. No DOM bindings, canvas rendering, browser interaction, network or external support scripts executed.", summary, results }, null, 2));
  console.log(JSON.stringify({ ...summary, missingExternalScripts: summary.missingExternalScripts.length, output }, null, 2));
}
