import { createRoot } from "react-dom/client";
import DashboardLayout from "@/app/(dashboard)/layout";
import { PressureDashboardClient } from "@/app/(dashboard)/pressure-calculator/PressureDashboardClient";
import { PressureCalculatorForm } from "@/components/features/pressure/PressureCalculatorForm";
import en from "@/i18n/messages/en";
import nl from "@/i18n/messages/nl";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { locale, fixture } from "../account-batch4/runtime";

const account = window.location.pathname.endsWith("/pressure-calculator");
const dictionary = locale === "nl" ? nl : en;
const content = account
  ? <DashboardLayout><PressureDashboardClient initialBikeId={fixture === "empty" ? undefined : "bike1"} /></DashboardLayout>
  : <main><PressureCalculatorForm locale={locale} labels={dictionary.pressure.form}
    resultLabels={dictionary.pressure.result} /></main>;
document.documentElement.lang = locale;
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>{content}</ToastProvider></ThemeProvider>);
