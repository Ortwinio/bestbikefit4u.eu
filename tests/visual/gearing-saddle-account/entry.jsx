import { createRoot } from "react-dom/client";
import DashboardLayout from "@/app/(dashboard)/layout";
import GearingPage from "@/app/(dashboard)/gearing/page";
import SaddlePage from "@/app/(dashboard)/saddle-selector/page";
import { GearingCalculatorForm } from "@/app/(public)/calculators/gearing/GearingCalculatorForm";
import { SaddleWidthCalculatorForm } from "@/app/(public)/calculators/saddle-width/SaddleWidthCalculatorForm";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { locale } from "../account-batch4/runtime";

const account = !window.location.pathname.includes("/calculators/");
const gearing = window.location.pathname.includes("gearing");
const content = account
  ? <DashboardLayout>{gearing ? <GearingPage /> : <SaddlePage />}</DashboardLayout>
  : <main>{gearing ? <GearingCalculatorForm isNl={locale === "nl"} /> : <SaddleWidthCalculatorForm isNl={locale === "nl"} />}</main>;
document.documentElement.lang = locale;
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>{content}</ToastProvider></ThemeProvider>);

