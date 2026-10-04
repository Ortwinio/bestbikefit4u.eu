import type { Metadata } from "next";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";

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

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-dvh w-full min-w-0 bg-background text-foreground"
    >
      {children}
    </main>
  );
}
