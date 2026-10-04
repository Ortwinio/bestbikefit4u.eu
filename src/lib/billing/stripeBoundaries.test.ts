import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decideProxyAction } from "@/i18n/proxyDecision";
import { stripeWebhookResponse } from "../../../convex/stripe/webhook";
import { stripeNotImplemented } from "./stripeStub";

function productionFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return ["__tests__", "_generated"].includes(entry.name) ? [] : productionFiles(filename);
    }
    return /\.[cm]?[jt]sx?$/.test(filename) && !/\.(test|spec)\.[^.]+$|\.d\.ts$/.test(filename)
      ? [filename]
      : [];
  });
}

function forbiddenReferences(filename: string): string[] {
  const content = readFileSync(filename, "utf8");
  const source = ts.createSourceFile(filename, content, ts.ScriptTarget.Latest, true);
  const failures: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteralLike(node)) {
      const value = node.text;
      const isModule = ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent)
        || (ts.isCallExpression(node.parent)
          && ["require", "import"].includes(node.parent.expression.getText(source)));
      if (isModule && /^(?:stripe(?:\/|$)|@stripe\/)/i.test(value)) {
        failures.push(`${filename}: Stripe SDK import`);
      }
      if (/(?:api|checkout|billing)\.stripe\.com/i.test(value)) failures.push(`${filename}: Stripe endpoint`);
      if (/pro[_ -]monthly|STRIPE_PRO_MONTHLY/i.test(value)) failures.push(`${filename}: retired product`);
    }
    if (ts.isIdentifier(node) && /^(?:STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|STRIPE_PRO_MONTHLY)/.test(node.text)) {
      failures.push(`${filename}: provider constructor or secret access`);
    }
    if (ts.isNewExpression(node) && node.expression.getText(source) === "Stripe") {
      failures.push(`${filename}: provider constructor`);
    }
    if (ts.isCallExpression(node) && /^stripe\.(?:customers|checkout|billingPortal|subscriptions|refunds|webhooks)\b/i
      .test(node.expression.getText(source))) failures.push(`${filename}: provider call`);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return failures;
}

afterEach(() => vi.unstubAllEnvs());
describe("release 2.0 Stripe integration boundaries", () => {
  it("has no SDK, provider endpoints, secret reads or retired monthly products in production source", () => {
    const files = ["src", "convex", "shared", "scripts"].flatMap(productionFiles);
    expect(files.flatMap(forbiddenReferences)).toEqual([]);
  });

  it("does not advertise provider credentials or obsolete price IDs in the environment template", () => {
    const example = readFileSync(".env.example", "utf8");
    expect(example).not.toMatch(/^STRIPE_(?:SECRET_KEY|WEBHOOK_SECRET|.*PRICE_ID)=/m);
    expect(example).not.toMatch(/STRIPE_PRO_MONTHLY/);
    expect(example).toContain("STRIPE_NOT_IMPLEMENTED");
  });

  it.each([undefined, "false", "true"])("keeps webhook inert with server billing=%s", async (server) => {
    for (const client of [undefined, "false", "true"]) {
      vi.stubEnv("STRIPE_BILLING_ENABLED", server);
      vi.stubEnv("NEXT_PUBLIC_STRIPE_BILLING_ENABLED", client);
      const response = stripeWebhookResponse();
      expect(response.status).toBe(501);
      expect(await response.json()).toEqual(stripeNotImplemented());
    }
  });

  it.each(["checkout", "portal", "cancel", "refund", "webhook"])(
    "does not rewrite /api/stripe/%s into a locale or login URL",
    (route) => {
      expect(decideProxyAction({
        pathname: `/api/stripe/${route}`,
        cookieLocale: "nl",
        acceptLanguageHeader: "nl",
        isAuthenticated: false,
      })).toEqual({ type: "bypass" });
    },
  );
});
