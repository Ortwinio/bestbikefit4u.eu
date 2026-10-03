import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import { extendRiderRuntime } from "../../../tests/visual/final-sweep/rider-fixtures.mjs";

export async function bundleFixture(root, family, enforced) {
  const folder = resolve(root, "tests/visual/account-batch2");
  let runtime = extendRiderRuntime(await readFile(resolve(folder, "runtime.jsx"), "utf8"),
    resolve(root, "tests/visual/final-sweep/rider-fixtures.mjs"));
  runtime = `import { getAccess } from ${JSON.stringify(resolve(root, "shared/pricing/access.ts"))};\n` + runtime;
  runtime = runtime.replace("window.__visualQueries = [];", `
const state = params.get("state") || "free";
const enforced = ${JSON.stringify(enforced)};
const now = Date.UTC(2026, 9, 3, 12);
const productId = state === "personal" ? "annual_personal" : ["paid", "renewed", "cancelled"].includes(state) ? "annual" : ["single", "other-bike"].includes(state) ? "single" : "free";
const entitlements = productId === "free" ? [] : [{
  productId, bikeId: productId === "single" ? (state === "other-bike" ? "visual-other-bike" : bike._id) : undefined,
  status: "active", startsAt: now - 86400000, expiresAt: Date.UTC(2027, 0, 3, 12),
  source: "purchase", appointmentGranted: state === "personal",
  periodPriceCents: state === "personal" ? 23450 : state === "renewed" ? 1950 : productId === "single" ? 1350 : 2450,
  renewed: state === "renewed", cancelled: state === "cancelled",
}];
const access = getAccess({ entitlements }, undefined, { enforced, now });
const bikeAccess = getAccess({ entitlements }, bike._id, { enforced, now });
const legacyFullAccess = state === "legacy";
const fullReport = bikeAccess.fullReport || legacyFullAccess;
const isLatestReport = state !== "free-older";
const reportAccess = { enforced, fullReport, legacyFullAccess, isLatestReport,
  canDownloadPdf: fullReport || isLatestReport, canEmailReport: fullReport || isLatestReport };
values["pricing/queries:getAccess"] = access;
values["pricing/queries:getSubscription"] = { access, entitlements, transitionOffer: null };
values["recommendations/queries:getReportAccess"] = reportAccess;
values["bikes/queries:get"] = bike;
values["integrations/queries:getStravaBikeOverview"] = [];
const originalReport = values["recommendations/queries:getReportV2"];
values["recommendations/queries:getReportV2"] = { ...originalReport, access: reportAccess,
  recommendation: fullReport ? originalReport.recommendation : {
    ...originalReport.recommendation, fitNotes: [], adjustmentPriorities: [], recommendationItems: [],
  },
};
window.__visualExpected = { state, enforced, productId, reportAccess, appointmentAvailable: access.appointmentAvailable };
window.__visualQueries = [];`);
  runtime = runtime.replace('isAuthenticated: !window.location.pathname.endsWith("/login")',
    'isAuthenticated: state !== "guest" && !window.location.pathname.endsWith("/pricing")');
  runtime += `
export const headers = async () => new Headers({ "x-bf-locale": locale });
export const cookies = async () => ({ get: name => name === "bf_locale" ? { value: locale } : undefined });
`;
  const common = `
import { Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { locale } from "p2-fixture-runtime";
function Ready({children}) { useEffect(() => { window.__visualReady = true; }, []); return children; }
document.documentElement.lang = locale;
`;
  const entries = {
    account: `
import Dashboard from "@/app/(dashboard)/dashboard/page";
import Settings from "@/app/(dashboard)/settings/page";
import Results from "@/app/(dashboard)/fit/[sessionId]/results/page";
import Layout from "@/app/(dashboard)/layout";
const pathname = window.location.pathname;
const content = pathname.endsWith("/settings") ? <Settings /> : pathname.endsWith("/results") ?
  <Results params={Promise.resolve({ sessionId: "visual-session" })} /> : <Dashboard />;
const tree = <Layout>{content}</Layout>;
`,
    pricing: `
import Page from "@/app/(public)/pricing/page";
import Layout from "@/app/(public)/layout";
const tree = await Layout({ children: await Page() });
`,
    checkout: `
import Page from "@/app/(checkout)/checkout/page";
import Layout from "@/app/(checkout)/checkout/layout";
const tree = Layout({ children: await Page({ searchParams: Promise.resolve(Object.fromEntries(new URLSearchParams(window.location.search))) }) });
`,
  };
  if (!entries[family]) throw new Error(`Unsupported fixture family: ${family}`);
  const entry = common + entries[family] + `
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>
  <Suspense fallback={<p>Loading fixture</p>}><Ready>{tree}</Ready></Suspense>
</ToastProvider></ThemeProvider>);
`;
  const environment = {
    NODE_ENV: "production", VERCEL_ENV: "preview", CHECKOUT_PREVIEW_ENABLED: "true",
    STRIPE_BILLING_ENABLED: "false", NEXT_PUBLIC_STRIPE_BILLING_ENABLED: "false",
    PAID_ACCESS_ENFORCED: String(enforced), NEXT_PUBLIC_PAID_ACCESS_ENFORCED: String(enforced),
    NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN: "false",
  };
  const bundle = await build({
    absWorkingDir: root, stdin: { contents: entry, resolveDir: root, loader: "jsx", sourcefile: `P2-${family}-entry.jsx` },
    bundle: true, write: false, outdir: resolve(root, "plans/pricing-v3/renders/p2-memory"),
    format: "esm", platform: "browser", jsx: "automatic", logLevel: "silent", metafile: true,
    define: { "process.env": JSON.stringify(environment),
      ...Object.fromEntries(Object.entries(environment).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])) },
    plugins: [{ name: "p2-isolated-services", setup(builder) {
      builder.onResolve({ filter: /^server-only$/ }, () => ({ path: "server-only-marker", namespace: "p2-marker" }));
      builder.onLoad({ filter: /.*/, namespace: "p2-marker" }, () => ({ contents: "export {};", loader: "js" }));
      builder.onResolve({ filter: /^(p2-fixture-runtime|convex\/react|@convex-dev\/auth\/react|next\/(navigation|headers)|@\/i18n\/request|@sentry\/nextjs)$/ },
        () => ({ path: "p2-runtime", namespace: "p2" }));
      builder.onLoad({ filter: /.*/, namespace: "p2" }, () => ({ contents: runtime, loader: "jsx", resolveDir: folder }));
      builder.onResolve({ filter: /^next\/link$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/link.jsx") }));
      builder.onResolve({ filter: /^next\/image$/ }, () => ({ path: resolve(root, "tests/visual/account-batch1/image.jsx") }));
    } }],
  });
  return {
    script: bundle.outputFiles.find(file => file.path.endsWith(".js")).contents,
    css: bundle.outputFiles.filter(file => file.path.endsWith(".css")).map(file => file.text).join("\n"),
    inputs: Object.keys(bundle.metafile.inputs),
  };
}
