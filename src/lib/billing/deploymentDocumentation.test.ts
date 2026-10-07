import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const documentation = readFileSync(resolve(root, "docs/VERCEL_DEPLOYMENT.md"), "utf8");

function runtimeSources(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = resolve(directory, entry.name);
    if (entry.isDirectory()) return runtimeSources(filename);
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [filename] : [];
  });
}

describe("billing deployment runbook", () => {
  it("keeps the restricted-key call inventory aligned with runtime provider operations", () => {
    const sources = ["src/lib/billing", "src/app/api/stripe"]
      .flatMap((directory) => runtimeSources(resolve(root, directory)))
      .map((filename) => readFileSync(filename, "utf8")).join("\n");
    const calls = [...sources.matchAll(/\bstripe\.([a-zA-Z.]+)\s*\(/g)].map((match) => match[1]);
    const expected = [
      "billingPortal.configurations.create", "billingPortal.sessions.create", "checkout.sessions.create",
      "coupons.retrieve", "customers.create", "invoicePayments.list", "invoices.retrieve",
      "paymentIntents.retrieve", "prices.retrieve", "refunds.create", "refunds.list",
      "subscriptions.cancel", "subscriptions.retrieve", "subscriptions.update",
    ];
    expect([...new Set(calls)].sort()).toEqual(expected.sort());
    for (const resource of ["Checkout Sessions", "Customers", "Prices", "Coupons", "Subscriptions",
      "Customer portal", "Invoices", "Invoice Payments", "PaymentIntents", "Refunds"]) {
      expect(documentation).toContain(`| ${resource} |`);
    }
    expect(documentation).toContain("billingPortal.configurations.create");
    expect(documentation).toContain("invoicePayments.list");
  });

  it("documents the actual disabled response, Convex endpoint and current configuration", () => {
    expect(documentation).not.toMatch(/STRIPE_PRO_(?:MONTHLY|YEARLY|PRICE)/);
    expect(documentation).toContain("STRIPE_NOT_IMPLEMENTED` (HTTP 501)");
    expect(documentation).toContain("https://<deployment>.convex.site/stripe/webhook");
    for (const name of ["STRIPE_MODE", "PERSONAL_FIT_SALES_ENABLED", "NEXT_PUBLIC_PERSONAL_FIT_SALES_ENABLED",
      "PERSONAL_BIKEFIT_AGENDA_URL", "FITTER_NOTIFICATION_EMAIL"]) {
      expect(documentation).toContain(`\`${name}\``);
    }
    expect(documentation).toContain("origin/feature/pricing-model-v2");
  });
});
