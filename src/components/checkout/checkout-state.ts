import { PRODUCTS, type PaidProductId } from "../../../shared/pricing/products";

export type CheckoutProduct = "single" | "annual" | "personal" | "personal_fit_standalone";
export type CheckoutSelection = { product: CheckoutProduct; bikeId: string };
export type CheckoutPreview = "success" | "failure" | null;
export const CHECKOUT_STORAGE_KEY = "bbf-checkout-v3";

export function isPaidCheckoutProductId(value: unknown): value is PaidProductId {
  return typeof value === "string" && value !== "free" && Object.prototype.hasOwnProperty.call(PRODUCTS, value);
}

export function parseCheckoutProduct(value: string | null | undefined): CheckoutProduct {
  if (value === "annual_personal") return "personal";
  if (value === "single" || value === "personal" || value === "personal_fit_standalone") return value;
  return "annual";
}

export function checkoutProductId(product: CheckoutProduct, eligibleForUpgrade: boolean): PaidProductId {
  return product === "personal" ? "annual_personal" : product === "annual" && eligibleForUpgrade ? "annual_upgrade" : product;
}

export function checkoutPrice(product: CheckoutProduct, eligibleForUpgrade: boolean): number {
  return PRODUCTS[checkoutProductId(product, eligibleForUpgrade)].priceCents / 100;
}

export function getCheckoutPreview(value: string | undefined, environment: Record<string, string | undefined>): CheckoutPreview {
  if (environment.CHECKOUT_PREVIEW_ENABLED !== "true" || environment.VERCEL_ENV === "production") return null;
  if (environment.NODE_ENV === "production" && environment.VERCEL_ENV !== "preview") return null;
  return value === "success" || value === "failure" ? value : null;
}

export function safeAgendaUrl(value: string | undefined): string | undefined {
  try {
    const url = new URL(value ?? "");
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function saveCheckoutSelection(selection: CheckoutSelection, eligibleForUpgrade = false): boolean {
  try {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify({ ...selection, product: checkoutProductId(selection.product, eligibleForUpgrade) }));
    const url = new URL(window.location.href);
    url.searchParams.set("product", checkoutProductId(selection.product, eligibleForUpgrade));
    if (selection.bikeId) url.searchParams.set("bikeId", selection.bikeId);
    else url.searchParams.delete("bikeId");
    window.history.replaceState(window.history.state, "", url);
    return true;
  } catch {
    return false;
  }
}

export function readCheckoutSelection(): CheckoutSelection | null {
  try {
    const value = JSON.parse(localStorage.getItem(CHECKOUT_STORAGE_KEY) ?? "null");
    if (!value || !["single", "annual", "annual_upgrade", "annual_personal", "personal", "personal_fit_standalone"].includes(value.product) || typeof value.bikeId !== "string") return null;
    return { product: parseCheckoutProduct(value.product), bikeId: value.bikeId };
  } catch {
    return null;
  }
}
