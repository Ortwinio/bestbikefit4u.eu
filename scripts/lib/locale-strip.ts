export function stripLocalePrefix(path: string) {
  return path.replace(/^\/?(en|nl)(?=\/|$)/, "") || "/";
}

export function stripGuidePrefix(path: string) {
  return stripLocalePrefix(path).replace(/^\/?guides\//, "");
}
