import type { Metadata } from "next";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/getDictionary";
import { Header } from "@/components/layout/Header";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    title: locale === "nl" ? "Inloggen | BikeFitBoost" : "Sign In | BikeFitBoost",
    description:
      locale === "nl"
        ? "Log in of maak je account aan om je persoonlijke BikeFitBoost-dashboard te openen."
        : "Sign in or create your account to open your personal BikeFitBoost dashboard.",
    alternates: { canonical: buildLocaleAlternates("/login", locale).canonical },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  return (
    <>
    <div className="lg:hidden">
      <Header
        locale={locale}
        labels={{
          common: dictionary.common,
          nav: dictionary.nav,
          dashboardNav: dictionary.dashboard.nav,
          dashboardSignOut: dictionary.dashboard.common.signOut,
        }}
      />
    </div>
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-[calc(100dvh-64px)] w-full min-w-0 bg-background text-foreground lg:min-h-dvh"
    >
      {children}
    </main>
    </>
  );
}
