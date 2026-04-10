export type PublicCalculatorId =
  | "bike-fit"
  | "gearing"
  | "saddle-height"
  | "saddle-width"
  | "frame-size"
  | "crank-length"
  | "tire-pressure";

export type PublicCalculatorRouteEntry = {
  id: PublicCalculatorId;
  canonicalPath: string;
  localizedPaths: {
    en: string;
    nl: string;
  };
  legacyAliases: string[];
};

export const PUBLIC_CALCULATOR_ROUTE_REGISTRY: Record<
  PublicCalculatorId,
  PublicCalculatorRouteEntry
> = {
  "bike-fit": {
    id: "bike-fit",
    canonicalPath: "/calculators/bike-fit",
    localizedPaths: {
      en: "/calculators/bike-fit",
      nl: "/calculators/bike-fit",
    },
    legacyAliases: [],
  },
  gearing: {
    id: "gearing",
    canonicalPath: "/calculators/gearing",
    localizedPaths: {
      en: "/calculators/gearing",
      nl: "/calculators/gearing",
    },
    legacyAliases: [],
  },
  "saddle-height": {
    id: "saddle-height",
    canonicalPath: "/calculators/saddle-height",
    localizedPaths: {
      en: "/calculators/saddle-height",
      nl: "/calculators/saddle-height",
    },
    legacyAliases: [],
  },
  "saddle-width": {
    id: "saddle-width",
    canonicalPath: "/calculators/saddle-width",
    localizedPaths: {
      en: "/calculators/saddle-width",
      nl: "/calculators/saddle-width",
    },
    legacyAliases: [],
  },
  "frame-size": {
    id: "frame-size",
    canonicalPath: "/calculators/frame-size",
    localizedPaths: {
      en: "/calculators/frame-size",
      nl: "/calculators/frame-size",
    },
    legacyAliases: [],
  },
  "crank-length": {
    id: "crank-length",
    canonicalPath: "/calculators/crank-length",
    localizedPaths: {
      en: "/calculators/crank-length",
      nl: "/calculators/crank-length",
    },
    legacyAliases: [],
  },
  "tire-pressure": {
    id: "tire-pressure",
    canonicalPath: "/tire-pressure-calculator",
    localizedPaths: {
      en: "/tire-pressure-calculator",
      nl: "/bandenspanning-calculator",
    },
    legacyAliases: ["/bandenspanning-calculator", "/pressure-calculator"],
  },
};

export function getPublicCalculatorRouteEntry(id: PublicCalculatorId) {
  return PUBLIC_CALCULATOR_ROUTE_REGISTRY[id];
}

export function getLocalizedPublicCalculatorPath(
  id: PublicCalculatorId,
  locale: "en" | "nl"
) {
  return PUBLIC_CALCULATOR_ROUTE_REGISTRY[id].localizedPaths[locale];
}
