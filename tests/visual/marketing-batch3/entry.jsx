import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import BlogIndex from "@/app/(public)/blog/page";
import BlogArticle from "@/app/(public)/blog/[slug]/page";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/i18n/getDictionary";
import { locale } from "./runtime";

const dictionary = await getDictionary(locale);
const path = window.location.pathname.replace(/^\/(nl|en)/, "");
const content = path === "/blog" ? await BlogIndex({ searchParams: Promise.resolve(Object.fromEntries(new URLSearchParams(window.location.search))) }) : await BlogArticle({ params: Promise.resolve({ slug: path.split("/").at(-1) }) });
document.documentElement.lang = locale;
createRoot(document.getElementById("root")).render(<ThemeProvider><Header locale={locale} labels={{ common: dictionary.common, nav: dictionary.nav, dashboardNav: dictionary.dashboard.nav, dashboardSignOut: dictionary.dashboard.common.signOut }} /><main id="main-content">{content}</main><Footer locale={locale} labels={{ howItWorks: dictionary.nav.howItWorks, pricing: dictionary.nav.pricing, footer: dictionary.nav.footer }} /></ThemeProvider>);
window.__visualReady = true;
