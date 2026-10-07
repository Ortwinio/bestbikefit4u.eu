import { createRoot } from "react-dom/client";
import PricingPage from "@/app/(public)/pricing/page";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import { isPersonalFitSalesVisible } from "@/config/personalFit";

const parameters = new URLSearchParams(window.location.search);
const locale = parameters.get("locale") === "en" ? "en" : "nl";
const surface = parameters.get("surface");
document.documentElement.lang = locale;
window.__fixture = { copy: checkoutCopy[locale], visible: isPersonalFitSalesVisible(), calls: [] };
const unexpectedCall = async () => {
  window.__fixture.calls.push("unexpected-service-call");
  throw new Error("Service calls are forbidden in the step-one fixture");
};
const content = surface === "pricing" ? <main>{await PricingPage()}</main> :
  <CheckoutFlow locale={locale} initialSelection={{ product: "annual", bikeId: "fixture-bike" }}
    authenticated accountId="fixture-rider" accountEmail="rider@example.test"
    bikes={[{ id: "fixture-bike", name: "Trek Domane SL 6" }]} standaloneEligible
    agendaUrl="https://agenda.example.test/appointment" signIn={unexpectedCall} startCheckout={unexpectedCall} />;
createRoot(document.getElementById("root")).render(content);
