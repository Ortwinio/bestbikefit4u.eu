"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { Button, InfoBox, SegmentedControl, SegmentedControlItem } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { BrandLogo } from "@/components/branding";
import { toolsApp } from "@/i18n/account/toolsApp";

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return Boolean(
    window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone,
  );
}

function detectAppleInstallContext() {
  if (typeof window === "undefined") {
    return {
      isAppleMobile: false,
      isSafari: false,
    };
  }

  const userAgent = navigator.userAgent;
  const isAppleMobile = /iphone|ipad|ipod/i.test(userAgent);
  const isSafari = /safari/i.test(userAgent) && !/(crios|fxios|edgios)/i.test(userAgent);

  return { isAppleMobile, isSafari };
}

export default function AppInstallPage() {
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("ios");
  const [standalone] = useState(() => isStandaloneMode());
  const { isAppleMobile, isSafari } = useMemo(() => detectAppleInstallContext(), []);

  useEffect(() => {
    if (isLoading || !standalone) {
      return;
    }

    const destination = isAuthenticated
      ? withLocalePrefix("/dashboard", locale)
      : withLocalePrefix("/login", locale);
    router.replace(destination);
  }, [isAuthenticated, isLoading, locale, router, standalone]);

  const copy = toolsApp[locale];
  const install = messages.settings.appInstall;
  const destination = withLocalePrefix(isAuthenticated ? "/dashboard" : "/login", locale);
  const destinationLabel = isAuthenticated ? install.openDashboard : copy.login;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 lg:px-[120px]">
          <BrandLogo href={withLocalePrefix("/", locale)} className="w-44 sm:w-52" />
          <Button render={<Link href={destination} />} nativeButton={false}>
            {destinationLabel}
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] space-y-8 px-5 py-10 lg:px-[120px] lg:py-14">
        <header className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">{copy.eyebrow}</p>
          <h1 className="max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-6xl">
            {copy.title}
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground">{copy.intro}</p>
        </header>
        <SegmentedControl
          aria-label={copy.platforms}
          value={platform}
          onValueChange={(value) => setPlatform(value as typeof platform)}
          className="flex flex-wrap gap-2"
        >
          {(["ios", "android", "desktop"] as const).map((value) => (
            <SegmentedControlItem key={value} value={value}>
              {copy[value]}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-7 rounded-3xl border border-border bg-card p-6 sm:p-8">
            {standalone ? (
              <InfoBox variant="success">
                <p className="font-semibold">{install.installedTitle}</p>
                <p className="mt-2">{install.installedDescription}</p>
              </InfoBox>
            ) : null}
            {!isSafari && isAppleMobile && platform === "ios" ? (
              <InfoBox variant="warning">
                <p className="font-semibold">{install.openInSafariTitle}</p>
                <p className="mt-2">{install.openInSafariDescription}</p>
              </InfoBox>
            ) : null}
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {platform === "ios" ? copy.steps : copy.missingTitle}
            </h2>
            {platform === "ios" ? (
              <ol className="space-y-7">
                {install.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      className={
                        "flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--bbf-lime)] " +
                        "font-mono text-[var(--bbf-inkt)]"
                      }
                    >
                      {index + 1}
                    </span>
                    <div className="space-y-2">
                      <h3 className="font-display text-xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="space-y-5 rounded-2xl bg-secondary p-6">
                <p>{copy.missing}</p>
                <Button render={<Link href={destination} />} nativeButton={false}>
                  {destinationLabel}
                </Button>
              </div>
            )}
          </section>
          <aside className="space-y-5">
            <div className="rounded-[28px] bg-[var(--bbf-lime)] p-7 text-[var(--bbf-inkt)]">
              <svg
                viewBox="0 0 300 190"
                className="mx-auto h-48 w-full"
                role="img"
                aria-label={copy.visual}
              >
                <rect
                  x="88"
                  y="6"
                  width="124"
                  height="178"
                  rx="24"
                  fill="white"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  d="M128 18h44M135 168h30"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect x="121" y="60" width="58" height="58" rx="16" fill="currentColor" />
                <g stroke="var(--bbf-lime)" strokeWidth="2" fill="none">
                  <circle cx="140" cy="91" r="9" />
                  <circle cx="161" cy="91" r="9" />
                  <path d="m140 91 8-17h8l5 17m-13-17 8 17" />
                </g>
              </svg>
              <h2 className="mt-5 font-display text-3xl font-bold text-[var(--bbf-inkt)]">
                {install.dashboardLaunchTitle}
              </h2>
              <p className="mt-3">{install.dashboardLaunchDescription}</p>
            </div>
            <Link
              href={withLocalePrefix("/settings", locale)}
              className="flex min-h-11 items-center font-semibold text-primary"
            >
              {install.backToSettings} →
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}
