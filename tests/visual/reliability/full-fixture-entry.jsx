import React from "react";
import { createRoot } from "react-dom/client";
import { AccountSaddleView } from "@/components/reliability/account/AccountSaddleView";
import { AccountKneeView } from "@/components/reliability/account/AccountKneeView";
import { accountSaddleFixture, kneeResultFixture } from "@/components/reliability/account/visualFixtures";
import { DashboardReliabilityFixture } from "@/components/dashboard/DashboardReliability.fixture";

const parameters = new URLSearchParams(location.search);
const locale = parameters.get("locale") === "nl" ? "nl" : "en";
const scenario = parameters.get("scenario") ?? "saddle-three";
let content;
if (scenario.startsWith("dashboard-")) {
  content = <DashboardReliabilityFixture locale={locale} scenario={scenario.slice(10)} />;
} else if (scenario.startsWith("saddle-")) {
  const measurements = scenario === "saddle-one" ? [89] : scenario === "saddle-spread" ? [89, 89, 90] : [89, 89, 89];
  content = <AccountSaddleView {...accountSaddleFixture(locale, measurements)} />;
} else {
  const angle = Number(scenario.slice(5));
  content = <AccountKneeView locale={locale} canUseKneeAngle={scenario !== "knee-locked"}
    hasMeasurements={scenario !== "knee-missing"} currentSaddleHeightMm={787}
    saved={Number.isFinite(angle) ? kneeResultFixture(angle) : undefined} onSave={async () => undefined} />;
}
createRoot(document.getElementById("root")).render(
  scenario.startsWith("dashboard-") ? content : <main>{content}</main>
);
