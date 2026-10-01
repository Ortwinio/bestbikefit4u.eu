import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";

const types = {
  ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json", ".map": "application/json", ".woff2": "font/woff2",
  ".woff": "font/woff", ".ttf": "font/ttf", ".svg": "image/svg+xml",
  ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon",
};
export const localAnalyticsPaths = ["/_vercel/insights/script.js", "/_vercel/speed-insights/script.js"];
export const isLoopback = (hostname) => ["localhost", "127.0.0.1", "[::1]"].includes(hostname);

/** Serve actual build assets; only Vercel-owned analytics scripts are explicit local QA no-ops. */
export async function serveQaAsset(request, response, { staticDir, fallbackStaticDirs = [] }) {
  const url = new URL(request.url, `http://${request.headers.host || "invalid"}`);
  if (localAnalyticsPaths.includes(url.pathname) && isLoopback(url.hostname)) {
    response.statusCode = 200;
    response.setHeader("content-type", types[".js"]);
    response.setHeader("x-qa-diagnostic", "local-vercel-analytics-disabled");
    response.end("/* Local QA preview: Vercel analytics is intentionally disabled. */\n");
    return true;
  }
  if (!url.pathname.startsWith("/_next/static/")) return false;
  let path;
  try { path = decodeURIComponent(url.pathname.slice("/_next/static/".length)); }
  catch { response.statusCode = 400; response.end("Invalid asset path"); return true; }
  const base = resolve(staticDir);
  const file = resolve(base, path);
  if (!file.startsWith(base + sep) || path.includes("\0")) {
    response.statusCode = 400;
    response.end("Invalid asset path");
    return true;
  }
  try {
    let body;
    for (const directory of [staticDir, ...fallbackStaticDirs]) {
      const candidateBase = resolve(directory);
      const candidate = resolve(candidateBase, path);
      if (!candidate.startsWith(candidateBase + sep)) throw new Error("Invalid asset path");
      try { body = await readFile(candidate); break; }
      catch (error) {
        if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      }
    }
    if (!body) {
      response.statusCode = 404;
      response.end("Build asset unavailable");
      return true;
    }
    response.statusCode = 200;
    response.setHeader("content-type", types[extname(file)] || "application/octet-stream");
    response.setHeader("x-content-type-options", "nosniff");
    response.setHeader("content-length", String(body.length));
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    console.error(error);
    response.statusCode = ["ENOENT", "EISDIR", "ENOTDIR"].includes(error.code) ? 404 : 500;
    response.setHeader("content-type", "text/plain; charset=utf-8");
    response.end("Build asset unavailable");
  }
  return true;
}
