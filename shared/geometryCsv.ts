export const GEOMETRY_IMPORT_HEADERS = [
  "brand_slug",
  "brand_name",
  "model_name",
  "model_year",
  "category",
  "size_label",
  "stack",
  "reach",
  "seat_tube_angle",
  "head_tube_angle",
  "wheelbase",
  "chainstay",
  "bb_drop",
  "effective_top_tube",
  "standover",
  "fork_rake",
  "head_tube_length",
  "seat_tube_length",
  "rider_height_min_cm",
  "rider_height_max_cm",
  "saddle_height_min_mm",
  "saddle_height_max_mm",
  "source",
  "source_url",
] as const;

export type GeometryImportHeader = (typeof GEOMETRY_IMPORT_HEADERS)[number];

export type GeometryCsvRow = Record<GeometryImportHeader, string | number | null | undefined>;

function escapeCsvCell(value: string | number | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}

export function buildGeometryCsv(rows: GeometryCsvRow[]) {
  const headerLine = GEOMETRY_IMPORT_HEADERS.join(",");
  const rowLines = rows.map((row) =>
    GEOMETRY_IMPORT_HEADERS.map((header) => escapeCsvCell(row[header])).join(",")
  );
  return [headerLine, ...rowLines].join("\n");
}
