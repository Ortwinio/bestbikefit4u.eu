import { createRoot } from "react-dom/client";
import PricingPage from "@/app/(public)/pricing/page";
import { PricingCard } from "@/components/pricing/PricingCard";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { SubscriptionOverview } from "@/components/account/SubscriptionOverview";
import { PRODUCTS } from "../../../shared/pricing/products";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import { subscriptionCopy } from "@/i18n/account/subscription";
import { scenarios } from "./cases.mjs";

const parameters = new URLSearchParams(window.location.search);
const locale = parameters.get("locale") === "en" ? "en" : "nl";
const scenario = scenarios.find(item => item.id === parameters.get("case"));
if (!scenario) throw new Error("Unknown visual scenario");
document.documentElement.lang = locale;
window.__fixture = { scenario, checkoutCopy: checkoutCopy[locale], subscriptionCopy: subscriptionCopy[locale], calls: [] };

const startsAt = Date.UTC(2026, 9, 4);
const expiresAt = Date.UTC(2027, 9, 4);
const baseAnnual = { plan: "annual", startsAt, expiresAt, periodPriceCents: 2150, renewed: false, enforced: true, canBuyAppointment: true };
const subscriptions = {
  loading: undefined,
  unavailable: null,
  free: { plan: "free", enforced: true },
  "free-open": { plan: "free", enforced: false },
  single: { plan: "single", bikeName: "Trek Domane SL 6", expiresAt: Date.UTC(2027, 0, 4), upgradeEligible: true, canBuyAppointment: true },
  "expired-upgrade": { plan: "free", upgradeEligible: true, canBuyAppointment: true, enforced: true },
  annual: baseAnnual,
  upgrade: { ...baseAnnual, periodPriceCents: 950 },
  renewed: { ...baseAnnual, renewed: true },
  personal: { ...baseAnnual, plan: "personal", periodPriceCents: 23450, appointmentAvailable: true },
  cancelled: { ...baseAnnual, cancelled: true },
  "cancel-confirm": baseAnnual,
  "cancel-off": baseAnnual,
  "cancel-confirmed": baseAnnual,
  "cancel-renewed-confirmed": { ...baseAnnual, renewed: true },
  "cancel-error": baseAnnual,
};

async function renderFixture() {
  if (scenario.surface === "pricing") return <main>{await PricingPage()}</main>;
  if (scenario.surface === "card") return <main className="min-h-screen bg-background px-4 py-12"><div style={{ maxWidth: 420, margin: "0 auto" }}><h1 className="mb-8 text-2xl">{locale === "nl" ? "Kies je meting" : "Choose your measurement"}</h1><PricingCard locale={locale} productId={scenario.product} href={`/${locale}/checkout?product=${scenario.product}`} /></div></main>;
  if (scenario.surface === "subscription") return <main className="dashboard-theme-context min-h-screen bg-background px-4 py-8 sm:px-8"><div style={{ maxWidth: 960, margin: "0 auto" }}><h1 className="mb-6 text-3xl">{locale === "nl" ? "Accountinstellingen" : "Account settings"}</h1><SubscriptionOverview locale={locale} subscription={subscriptions[scenario.state]} /></div></main>;
  const product = scenario.product === "annual_personal" ? "personal" : scenario.product === "annual_upgrade" ? "annual" : scenario.product;
  const paymentStatus = { pending: "pending", paid: "success", failed: "failure" }[scenario.state] ?? null;
  return <CheckoutFlow locale={locale} initialSelection={{ product, bikeId: "fixture-bike" }}
    authenticated={!(["auth", "code"].includes(scenario.state))} accountId="fixture-rider" accountEmail="rider@example.test"
    bikes={[{ id: "fixture-bike", name: "Trek Domane SL 6" }]} upgradeEligible={scenario.product === "annual_upgrade"}
    standaloneEligible={scenario.product === "personal_fit_standalone" && scenario.state !== "standalone-ineligible"}
    paymentStatus={paymentStatus} paymentReceipt={paymentStatus ? { productId: scenario.product, amountTotalCents: PRODUCTS[scenario.product].priceCents } : undefined}
    signIn={async () => { window.__fixture.calls.push("mock-sign-in"); }}
    startCheckout={scenario.state === "billing-off" ? undefined : async () => { window.__fixture.calls.push("mock-checkout"); if (scenario.state === "payment-error") throw new Error("Mock payment error"); }} />;
}

createRoot(document.getElementById("root")).render(await renderFixture());
