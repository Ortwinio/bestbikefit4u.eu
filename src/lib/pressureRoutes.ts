export const DASHBOARD_PRESSURE_CALCULATOR_PATH = "/pressure-calculator";

export function getDashboardPressureCalculatorPath(bikeId?: string) {
  if (!bikeId) {
    return DASHBOARD_PRESSURE_CALCULATOR_PATH;
  }

  return `${DASHBOARD_PRESSURE_CALCULATOR_PATH}?bikeId=${bikeId}`;
}
