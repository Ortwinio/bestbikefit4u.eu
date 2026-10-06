import { createRoot } from "react-dom/client";
import Dashboard from "@/app/(dashboard)/dashboard/page";
import Profile from "@/app/(dashboard)/profile/page";
import Login from "@/app/(auth)/login/page";
import DashboardLayout from "@/app/(dashboard)/layout";
import AuthLayout from "@/app/(auth)/layout";
import Flexibility from "@/app/(dashboard)/profile/improve/flexibility/page";
import Core from "@/app/(dashboard)/profile/improve/core-stability/page";
import Comfort from "@/app/(dashboard)/profile/improve/comfort/page";
import Measurements from "@/app/(dashboard)/profile/improve/body-measurements/page";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { locale } from "./runtime";
import { FeedbackFloatingButton } from "@/components/feedback/FeedbackFloatingButton";
import { accountFeedbackPlacement } from "@/components/account/account-feedback-placement";
import { getFeedbackCopy } from "@/components/feedback/feedback-copy";

const pathname = window.location.pathname.replace(/^\/(nl|en)/, "");
const guides = {
  "/profile/improve/flexibility": Flexibility,
  "/profile/improve/core-stability": Core,
  "/profile/improve/comfort": Comfort,
  "/profile/improve/body-measurements": Measurements,
};
document.documentElement.lang = locale;
const content = guides[pathname] ? await guides[pathname]() : pathname === "/profile" ? <Profile /> : <Dashboard />;
const tree = pathname === "/login" ? await AuthLayout({ children: <Login /> }) : <DashboardLayout>{content}</DashboardLayout>;
createRoot(document.getElementById("root")).render(<ThemeProvider><ToastProvider>{tree}<FeedbackFloatingButton flowOnMobile label={getFeedbackCopy(locale).page.floatingCta} className={accountFeedbackPlacement(window.location.pathname)} onClick={() => {}} /></ToastProvider></ThemeProvider>);
window.__visualReady = true;
