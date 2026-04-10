export type PublicCalculatorKey =
  | "bike-fit"
  | "saddle-height"
  | "frame-size"
  | "crank-length"
  | "tire-pressure";

export interface PublicCalculatorCatalogEntry {
  key: PublicCalculatorKey;
  family: "fit" | "pressure";
  currentPath: string;
  plannedCanonicalPath?: string;
  title: {
    en: string;
    nl: string;
  };
}

export const PUBLIC_CALCULATOR_CATALOG: Record<
  PublicCalculatorKey,
  PublicCalculatorCatalogEntry
> = {
  "bike-fit": {
    key: "bike-fit",
    family: "fit",
    currentPath: "/calculators/bike-fit",
    title: {
      en: "Bike Fit Calculator",
      nl: "Bike fit calculator",
    },
  },
  "saddle-height": {
    key: "saddle-height",
    family: "fit",
    currentPath: "/calculators/saddle-height",
    title: {
      en: "Saddle Height Calculator",
      nl: "Zadelhoogte calculator",
    },
  },
  "frame-size": {
    key: "frame-size",
    family: "fit",
    currentPath: "/calculators/frame-size",
    title: {
      en: "Frame Size Calculator",
      nl: "Framemaat calculator",
    },
  },
  "crank-length": {
    key: "crank-length",
    family: "fit",
    currentPath: "/calculators/crank-length",
    title: {
      en: "Crank Length Calculator",
      nl: "Cranklengte calculator",
    },
  },
  "tire-pressure": {
    key: "tire-pressure",
    family: "pressure",
    currentPath: "/tire-pressure-calculator",
    title: {
      en: "Tire Pressure Calculator",
      nl: "Bandenspanning calculator",
    },
  },
};
