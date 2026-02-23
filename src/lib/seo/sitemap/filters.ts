import { ROBOTS_DISALLOW_PATHS } from "./config";
import { normalizePathname } from "./normalize";
import type { SitemapUrlNode } from "./types";

function matchesDisallowedRule(pathname: string, rule: string): boolean {
  if (rule.endsWith("/")) {
    return pathname.startsWith(rule);
  }

  return pathname === rule || pathname.startsWith(`${rule}/`);
}

export function isBlockedByRobots(pathname: string): boolean {
  const normalized = normalizePathname(pathname);
  return ROBOTS_DISALLOW_PATHS.some((rule) =>
    matchesDisallowedRule(normalized, rule)
  );
}

export function isCanonicalSitemapPath(pathname: string): boolean {
  const normalized = normalizePathname(pathname);

  if (normalized !== pathname) {
    return false;
  }

  if (pathname.includes("?") || pathname.includes("#")) {
    return false;
  }

  return pathname === pathname.toLowerCase();
}

export function dedupeAndSortNodes(nodes: SitemapUrlNode[]): SitemapUrlNode[] {
  const byLoc = new Map<string, SitemapUrlNode>();

  for (const node of nodes) {
    if (!byLoc.has(node.loc)) {
      byLoc.set(node.loc, node);
      continue;
    }

    const previous = byLoc.get(node.loc);
    if (!previous) {
      continue;
    }

    if (node.lastmod > previous.lastmod) {
      byLoc.set(node.loc, node);
    }
  }

  return [...byLoc.values()].sort((a, b) => a.loc.localeCompare(b.loc));
}
