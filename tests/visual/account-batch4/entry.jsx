import { AccountPerformanceCalculator } from "@/components/calculators/AccountPerformanceCalculator";
import { AccountFitCalculator } from "@/components/calculators/AccountFitCalculator";
import { AccountSaddleHeight } from "@/components/reliability/account/AccountSaddleHeight";
import { AccountBikeFitCalculator } from "@/components/calculators/AccountBikeFitCalculator";
import { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { PressureDashboardClient } from "@/app/(dashboard)/pressure-calculator/PressureDashboardClient";
import Gearing from "@/app/(dashboard)/gearing/page";
import Saddle from "@/app/(dashboard)/saddle-selector/page";
import Cleat from "@/app/(dashboard)/shoe-cleat-fit/page";
import Settings from "@/app/(dashboard)/settings/page";
import { FeedbackAccountPage } from "@/app/(dashboard)/feedback/FeedbackAccountPage";
import AppInstall from "@/app/app/page";
import DashboardLayout from "@/app/(dashboard)/layout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { locale, fixture } from "./runtime";

const route = window.location.pathname.replace(/^\/(nl|en)/, "");
const pages = {
  "/tools/power-speed": <AccountPerformanceCalculator calculator="power-speed" />,
  "/tools/climb-planner": <AccountPerformanceCalculator calculator="climb-planner" />,
  "/tools/ftp-wkg": <AccountPerformanceCalculator calculator="ftp-wkg" />,
  "/tools/fuel-hydration": <AccountPerformanceCalculator calculator="fuel-hydration" />,

  "/tools/bike-fit": <AccountBikeFitCalculator />,
  "/tools/saddle-height": <AccountSaddleHeight />,
  "/tools/frame-size": <AccountFitCalculator calculator="frame-size" />,
  "/tools/crank-length": <AccountFitCalculator calculator="crank-length" />,
  "/pressure-calculator": (
    <PressureDashboardClient initialBikeId={fixture === "filled" ? "bike1" : undefined} />
  ),
  "/gearing": <Gearing />,
  "/saddle-selector": <Saddle />,
  "/shoe-cleat-fit": <Cleat />,
  "/settings": <Settings />,
  "/feedback": <FeedbackAccountPage />,
  "/app": <AppInstall />,
};
const page = pages[route];
if (!page) throw new Error(`Unknown fixture route ${route}`);
document.documentElement.lang = locale;
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <ToastProvider>
      <Suspense fallback={<p>Loading fixture</p>}>
        {route === "/app" ? page : <DashboardLayout>{page}</DashboardLayout>}
      </Suspense>
    </ToastProvider>
  </ThemeProvider>,
);
window.__visualReady = true;
