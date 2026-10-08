import React from "react";
import { createRoot } from "react-dom/client";
import { TransitionOfferView } from "../../../src/components/billing/TransitionOffer";
import { PaidBoundary } from "../../../src/components/billing/PaidBoundary";
import { transitionOfferCopy } from "../../../src/i18n/account/transitionOffer";

const params = new URLSearchParams(location.search);
const locale = params.get("locale");
const state = params.get("state");
const surface = params.get("surface");
const copy = transitionOfferCopy[locale];
const bikes = [{ _id: "fixture-bike", name: "Road bike" }];
const offer = state === "available" ? { status: state, redeemBy: Date.UTC(2027, 0, 7) }
  : state === "upcoming" ? { status: state, goLiveAt: Date.UTC(2026, 10, 7) }
  : { status: "redeemed", bikeId: "fixture-bike", expiresAt: Date.UTC(2027, 1, 7) };
document.documentElement.lang = locale;
window.__transitionFixture = { ready: false, calls: [], verifyState() {
  const text = document.body.textContent;
  const visible = surface === "dashboard" ? state !== "redeemed" : state === "available";
  const headings = [...document.querySelectorAll("h2")];
  return [
    { name: "offer visibility", passed: headings.some(node => node.textContent === copy.title) === visible },
    { name: "no dialogs", passed: !document.querySelector('[role="dialog"]') },
    { name: "price information preserved", passed: surface !== "paid-limit" || text.includes("13") },
    { name: "no mutation called", passed: window.__transitionFixture.calls.length === 0 },
  ];
} };
createRoot(document.getElementById("root")).render(<main className="mx-auto max-w-4xl space-y-6 p-6">
  <h1 className="font-display text-3xl font-bold">{surface === "dashboard" ? "Dashboard" : "Road bike"}</h1>
  <TransitionOfferView locale={locale} offer={offer} bikes={bikes}
    bikeId={surface === "paid-limit" ? "fixture-bike" : undefined}
    onRedeem={async () => { throw new Error("No real redemption in visual fixture"); }} />
  {surface === "paid-limit" && <PaidBoundary locale={locale} boundary="report" bikeId="fixture-bike" />}
</main>);
requestAnimationFrame(() => { window.__transitionFixture.ready = true; });
