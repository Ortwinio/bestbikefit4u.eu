import { readdir, stat } from "node:fs/promises";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";

export const videoAllowList = new Set(["bestbikefit4u-home.mp4", "bestbikefit4u-home.webm"]);
export async function checkImageWeight(root = "public") {
  const failures = [];
  let total = 0;
  for (const name of await readdir(root, { recursive: true })) {
    const info = await stat(`${root}/${name}`);
    if (!info.isFile()) continue;
    total += info.size;
    const extension = extname(name).toLowerCase();
    if ([".mp4", ".webm", ".mov", ".m4v"].includes(extension)) {
      if (!videoAllowList.has(name)) failures.push(`${name}: video is not explicitly allowed`);
      continue;
    }
    const limit = extension === ".svg" ? 150000
      : [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".ico", ".bmp", ".tiff"].includes(extension)
        ? 300000 : null;
    if (limit && info.size > limit) failures.push(`${name}: ${info.size} bytes exceeds ${limit}`);
    if (name.startsWith("illustrations/guides/") && extension === ".svg") {
      failures.push(`${name}: editable guide sources belong outside public`);
    }
  }
  return { totalBytes: total, failures };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = await checkImageWeight();
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length) process.exitCode = 1;
}
