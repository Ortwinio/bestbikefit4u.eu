import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import Dashboard from "@/app/(dashboard)/dashboard/page";
import Bikes from "@/app/(dashboard)/bikes/page";
import NewBike from "@/app/(dashboard)/bikes/new/page";
import Manual from "@/app/(dashboard)/bikes/new/manual/page";
import Passport from "@/app/(dashboard)/bikes/import/passport/page";
import Compare from "@/app/(dashboard)/bikes/compare-fit/page";
import Detail from "@/app/(dashboard)/bikes/[bikeId]/page";
import Edit from "@/app/(dashboard)/bikes/[bikeId]/edit/page";
import DashboardLayout from "@/app/(dashboard)/layout";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { locale } from "./account-fixture-bikes-runtime";
const pathname = window.location.pathname.replace(/^\/(nl|en)/, "");
const routes = {
  "/dashboard": Dashboard,
  "/bikes": Bikes,
  "/bikes/new/manual": Manual,
  "/bikes/import/passport": Passport,
  "/bikes/compare-fit": Compare,
};
const params = Promise.resolve({ bikeId: "visual-bike" });
const Component = routes[pathname];
const content =
  pathname === "/bikes/new" ? (
    await NewBike()
  ) : Component ? (
    <Component />
  ) : pathname.endsWith("/edit") ? (
    <Edit params={params} />
  ) : (
    <Detail params={params} />
  );
document.documentElement.lang = locale;
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <ToastProvider>
      <DashboardLayout>
        <Suspense fallback={<p>Loading</p>}>{content}</Suspense>
      </DashboardLayout>
    </ToastProvider>
  </ThemeProvider>,
);
window.__visualReady = true;
