export function isPersonalFitSalesEnabled(): boolean {
  return process.env.PERSONAL_FIT_SALES_ENABLED === "true";
}

export function isPersonalFitSalesVisible(): boolean {
  return process.env.NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED === "true";
}
