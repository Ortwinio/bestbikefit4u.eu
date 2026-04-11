import type { Metadata } from "next";
import { BrandLogo } from "@/components/branding";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();

  return {
    title: locale === "nl" ? "Inloggen | BestBikeFit4U" : "Sign In | BestBikeFit4U",
    description:
      locale === "nl"
        ? "Log in of maak je account aan om je persoonlijke BestBikeFit4U-dashboard te openen."
        : "Sign in or create your account to open your personal BestBikeFit4U dashboard.",
    alternates: buildLocaleAlternates("/login", locale),
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

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--surface-secondary)] px-4 text-[color:var(--foreground)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
        <div className="mb-8 w-full">
          <BrandLogo
            href={withLocalePrefix("/", locale)}
            asset="primary"
            className="block w-full max-w-[468px]"
            imageClassName="block"
          />
        </div>
        <main id="main-content" tabIndex={-1} className="w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
