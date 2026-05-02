type BikeFitHrefBike = {
  brand: string;
  model: string;
};

export function buildBikeFitHref(baseHref: string, bike: BikeFitHrefBike) {
  const [pathAndQuery, hashFragment = ""] = baseHref.split("#");
  const [path, existingQuery = ""] = pathAndQuery.split("?");
  const params = new URLSearchParams(existingQuery);

  params.set("bike", `${bike.brand} ${bike.model}`.trim());

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hashFragment ? `#${hashFragment}` : ""}`;
}
