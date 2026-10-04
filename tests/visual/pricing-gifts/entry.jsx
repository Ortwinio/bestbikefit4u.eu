import { createRoot } from "react-dom/client";
import { GiftGive } from "@/components/gifts/GiftGive";
import { GiftRedeem } from "@/components/gifts/GiftRedeem";

const parameters = new URLSearchParams(window.location.search);
const locale = parameters.get("locale") === "en" ? "en" : "nl";
const state = parameters.get("state") || "give";
const expiresAt = Date.UTC(2026, 10, 4);
const give = state.startsWith("give");
document.documentElement.lang = locale;

const gifts = [
  { id: "pending", status: "pending", expiresAt },
  { id: "sent", status: "sent", expiresAt },
  { id: "redeemed", status: "redeemed", expiresAt },
  { id: "expired", status: "expired", expiresAt: Date.UTC(2026, 8, 4) },
];

createRoot(document.getElementById("root")).render(
  <main className={give ? "dashboard-theme-context min-h-screen bg-background px-4 py-8 sm:px-8" : "min-h-screen bg-background"}>
    {give ? <GiftGive locale={locale} available={state === "give-exhausted" ? 0 : 1} eligible={state !== "give-ineligible"} gifts={gifts} onSend={async () => {}} />
      : <GiftRedeem locale={locale} state={state === "redeem" ? "valid" : state} expiresAt={expiresAt} authenticated={state === "redeem"} bikes={state === "redeem" ? [{ id: "owned", name: locale === "nl" ? "Mijn racefiets" : "My road bike" }] : []} onRedeem={async () => {}} />}
  </main>,
);
