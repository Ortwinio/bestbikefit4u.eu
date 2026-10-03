import type { EstimateSource } from "./types";

export const FLEXIBILITY_SOURCES = [
  {
    title: "Soucie et al. (2011): Range of motion measurements: reference values and a database for comparison studies",
    url: "https://pubmed.ncbi.nlm.nih.gov/21070485/",
    limitation: "Age- and sex-group reference means describe passive joint angles in healthy participants aged 2–69. " +
      "They do not establish an individual prediction or a mapping to the app's five seated-reaching categories.",
  },
  {
    title: "CDC: Normal Joint Range of Motion Study — reference values and methods",
    url: "https://archive.cdc.gov/www_cdc_gov/ncbddd/jointrom/index.html",
    limitation: "The reference table reports joint-specific angles, not distances to knees, shins, ankles or toes. " +
      "No conversion from these population means to an app flexibilityScore is supported here.",
  },
] as const satisfies readonly EstimateSource[];

export const FLEXIBILITY_REFERENCE_STATUS = {
  status: "unsupported_category_mapping",
  placeholder: "[PLACEHOLDER — bron?]",
  display: false,
  referenceTable: null,
} as const;
