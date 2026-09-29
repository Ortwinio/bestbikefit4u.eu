#!/usr/bin/env node
// Runtime QA for .dc.html boards: runs renderVals(), fires every handler
// (sliders at min/mid/max, every button), and checks each {{hole}} resolves
// to a defined, finite value in every resulting state.
// Usage: node plans/redesign-canvas/check-runtime.mjs <file.dc.html> [...]
import { readFileSync } from "node:fs";
import vm from "node:vm";

const lookup = (scope, path) => path.trim().split(".").reduce((v, k) => (v == null ? undefined : v[k]), scope);

let failed = 0;
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, "utf8");
  const body = src.split("<x-dc>")[1].split("</x-dc>")[0].replace(/<helmet>[\s\S]*?<\/helmet>/, "");
  const code = src.match(/<script type="text\/x-dc" data-dc-script[^>]*>([\s\S]*?)<\/script>/)[1];
  const ctx = vm.createContext({ Math, Number, String, Array, Object, JSON, isFinite, parseFloat, parseInt, console });
  vm.runInContext(`class DCLogic { constructor(p){ this.props = p || {}; this.state = {}; }
    setState(u){ const n = typeof u === 'function' ? u(this.state, this.props) : u; this.state = Object.assign({}, this.state, n); }
    forceUpdate(){} }\n${code}\n;globalThis.__C = Component;`, ctx);
  const errors = new Set();
  const unbound = new Set();
  const comp = new ctx.__C({});
  if (comp.componentDidMount) try { comp.componentDidMount(); } catch (e) { errors.add("componentDidMount: " + e.message); }

  // Parse template with loop scoping: each hole knows the chain of enclosing <sc-for>s.
  const holesScoped = [];
  const stack = [];
  for (const m of body.matchAll(/<sc-for list="\{\{([^}]+)\}\}" as="(\w+)"[^>]*>|<\/sc-for>|\{\{([^}]+)\}\}/g)) {
    if (m[0].startsWith("<sc-for")) stack.push({ list: m[1].trim(), as: m[2], parents: [...stack] });
    else if (m[0] === "</sc-for>") stack.pop();
    else if (!m[0].startsWith("<")) {
      const h = m[3].trim();
      if (/^(true|false|null|-?\d+(\.\d+)?|'.*'|".*")$/.test(h) || h === "$index") continue;
      holesScoped.push({ h, loops: [...stack] });
    }
  }
  const seen = new Set();
  const holes = holesScoped.filter((x) => { const k = x.h + "|" + x.loops.map((l) => l.list).join(">"); if (seen.has(k)) return false; seen.add(k); return true; });
  const ranges = [...body.matchAll(/<input\b[^>]*type="range"[^>]*>/g)].map((m) => m[0]);

  const render = (label) => {
    let vals;
    try { vals = comp.renderVals(); } catch (e) { errors.add(`renderVals throws (${label}): ${e.message}`); return null; }
    const check = (h, scope) => {
      const v = lookup(scope, h);
      if (v === undefined || (typeof v === "number" && !isFinite(v))) errors.add(`{{${h}}} is ${v} (${label})`);
      if (typeof v === "string" && /NaN|undefined|Infinity/.test(v)) errors.add(`{{${h}}} renders "${v}" (${label})`);
    };
    const scopes = (loops, scope) => {
      if (!loops.length) return [scope];
      const [l, ...rest] = loops;
      const list = lookup(scope, l.list) || [];
      return list.flatMap((item) => scopes(rest, { ...scope, [l.as]: item }));
    };
    for (const { h, loops } of holes) for (const sc of scopes(loops, vals)) check(h, sc);
    return vals;
  };

  let vals = render("initial");
  let states = 1;
  // Fire every handler reachable from renderVals, several passes to reach nested states.
  for (let pass = 0; pass < 3 && vals; pass++) {
    const handlers = [];
    const walk = (o, path, depth) => {
      if (depth > 3 || o == null) return;
      if (typeof o === "function") return handlers.push(path);
      if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${path}.${i}`, depth + 1));
      else if (typeof o === "object") for (const k of Object.keys(o)) walk(o[k], path ? `${path}.${k}` : k, depth + 1);
    };
    walk(vals, "", 0);
    const loopDefs = [...body.matchAll(/<sc-for list="\{\{([^}]+)\}\}" as="(\w+)"/g)].map((m) => ({ list: m[1].trim(), as: m[2] }));
    for (const hp of handlers) {
      // template name of this handler: top-level `{{hp}}`, or `{{as.key}}` for loop items (list.N.key)
      let tpl = hp;
      const lm = hp.match(/^(.+)\.\d+\.([\w$]+)$/);
      if (lm) { const l = loopDefs.find((d) => d.list === lm[1]); if (l) tpl = `${l.as}.${lm[2]}`; }
      if (!body.includes(`{{${tpl}}}`)) { unbound.add(hp.replace(/\.\d+\./, ".N.")); continue; }
      const sliderAttr = ranges.find((r) => r.includes(`{{${tpl}}}`));
      const values = [];
      if (sliderAttr) {
        const itemScope = lm ? { ...vals, [tpl.split(".")[0]]: lookup(vals, hp.split(".").slice(0, -1).join(".")) } : vals;
        const num = (a) => { const m = sliderAttr.match(new RegExp(`${a}="([^"]+)"`)); if (!m) return undefined; const raw = m[1]; const t = raw.match(/^\{\{(.+)\}\}$/); return Number(t ? lookup(itemScope, t[1]) : raw); };
        const min = num("min"), max = num("max");
        if (isFinite(min) && isFinite(max)) values.push(min, (min + max) / 2, max);
      }
      if (!values.length) values.push(/email/i.test(hp) ? "rider@example.com" : /code/i.test(hp) ? "123456" : undefined);
      for (const value of values) {
        const fn = lookup(vals, hp);
        if (typeof fn !== "function") continue;
        try { fn({ target: { value: String(value), checked: true }, preventDefault() {}, currentTarget: { value: String(value) } }); }
        catch (e) { errors.add(`handler ${hp}(${value}) throws: ${e.message}`); continue; }
        const v2 = render(`after ${hp}=${value}`);
        states++;
        if (v2) vals = v2;
      }
    }
  }
  console.log(`${errors.size ? "FAIL" : "PASS"}  ${file}  (${states} states)`);
  for (const e of [...errors].slice(0, 15)) console.log("  ✗ " + e);
  for (const u of unbound) console.log("  ! handler not bound in template: " + u);
  if (errors.size) failed++;
}
process.exit(failed ? 1 : 0);
