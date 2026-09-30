import { build } from "esbuild";
import { Module } from "node:module";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";

// Actual shared Slider, development React, and the two original route defaults; no source modification.
const root = process.argv[2] || process.cwd();
const component = resolve(root, "src/components/ui/Slider.tsx");
const setup = `import React from 'react'; import {Slider} from ${JSON.stringify(component)};
const App=({value})=><Slider label="Diagnostic" value={value} min={0} max={3000} onChange={()=>{}}/>;`;
const common = { absWorkingDir: root, bundle: true, write: false, jsx: "automatic",
  define: { "process.env.NODE_ENV": '"development"' }, logLevel: "error" };
const server = await build({ ...common, platform: "node", format: "cjs", stdin: {
  contents: setup + `import {renderToString} from 'react-dom/server';
export const render=(value)=>renderToString(<App value={value}/>);`, loader: "jsx", resolveDir: root,
} });
const serverModule = new Module(resolve(root, "slider-diagnostic.cjs"));
serverModule.paths = Module._nodeModulePaths(root);
serverModule._compile(server.outputFiles[0].text, resolve(root, "slider-diagnostic.cjs"));
const results = [];
const browser = await chromium.launch({ headless: true });
try {
  for (const value of [2105, 8.5]) {
    const html = serverModule.exports.render(value);
    const client = await build({ ...common, platform: "browser", format: "iife", stdin: {
      contents: setup + `import {hydrateRoot} from 'react-dom/client'; window.hydrationErrors=[];
hydrateRoot(document.getElementById('root'),<App value={${value}}/>,{
 onRecoverableError(error,info){
  window.hydrationErrors.push({message:error.message,componentStack:info.componentStack});
 }
});`, loader: "jsx", resolveDir: root,
    } });
    for (const locale of ["nl-NL", "en-GB"]) {
      const context = await browser.newContext({ locale });
      const page = await context.newPage();
      await page.setContent(`<div id="root">${html}</div>`);
      const before = await page.locator("output").textContent();
      await page.addScriptTag({ content: client.outputFiles[0].text });
      await page.waitForTimeout(300);
      results.push({ value, locale, serverText: before, clientText: await page.locator("output").textContent(),
        errors: await page.evaluate(() => window.hydrationErrors) });
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(resolve("plans/redesign-canvas/final-sweep/25d-slider-hydration.json"),
  JSON.stringify({ component, mode: "actual component, development React SSR/hydration", results }, null, 2) + "\n");
console.log(JSON.stringify(results, null, 2));
