export const publicCalculators = [
  { key: "bike-fit", path: "/calculators/bike-fit", template: true },
  { key: "saddle-height", path: "/calculators/saddle-height", template: false },
  { key: "frame-size", path: "/calculators/frame-size", template: true },
  { key: "crank-length", path: "/calculators/crank-length", template: true },
  { key: "saddle-width", path: "/calculators/saddle-width", template: true },
  { key: "gearing", path: "/calculators/gearing", template: true },
  { key: "ftp-wkg", path: "/calculators/ftp-wkg", template: true },
  { key: "power-speed", path: "/calculators/power-speed", template: true },
  { key: "fuel-hydration", path: "/calculators/fuel-hydration", template: true },
  { key: "climb-planner", path: "/calculators/climb-planner", template: true },
  { key: "tire-pressure", path: { nl: "/bandenspanning-calculator", en: "/tire-pressure-calculator" }, template: false },
];

export function calculatorPath(calculator, locale) {
  return `/${locale}${typeof calculator.path === "string" ? calculator.path : calculator.path[locale]}`;
}

export const reuseTargets = ["frame-size", "crank-length", "bike-fit"];
