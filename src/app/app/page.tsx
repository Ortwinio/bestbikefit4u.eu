"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { Button, Card, CardContent, CardHeader, CardTitle, InfoBox } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Share2, Smartphone, SquarePlus, LayoutDashboard } from "lucide-react";

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return Boolean(
    window.matchMedia("(display-mode: standalone)").matches ||
      navigatorWithStandalone.standalone
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

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card variant="bordered" className="w-full overflow-hidden">
        <div className="border-b border-[color:var(--border)] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_14%,white_86%)_0%,color-mix(in_oklch,var(--secondary)_26%,white_74%)_100%)]">
          <CardHeader className="space-y-4 px-6 py-6 sm:px-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)] shadow-sm">
              <Smartphone className="h-3.5 w-3.5" />
              {messages.settings.appInstall.eyebrow}
            </div>
            <CardTitle className="text-3xl tracking-tight text-[color:var(--foreground)]">
              {messages.settings.appInstall.title}
            </CardTitle>
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
              {messages.settings.appInstall.description}
            </p>
          </CardHeader>
        </div>

        <CardContent className="space-y-6 px-6 py-6 sm:px-8">
          {standalone ? (
            <InfoBox variant="success" icon={<LayoutDashboard className="h-4 w-4 text-[color:var(--success)]" />}>
              <p className="font-medium">{messages.settings.appInstall.installedTitle}</p>
              <p className="mt-1">{messages.settings.appInstall.installedDescription}</p>
            </InfoBox>
          ) : null}

          {!isSafari && isAppleMobile ? (
            <InfoBox variant="warning" icon={<Share2 className="h-4 w-4 text-[color:var(--warning)]" />}>
              <p className="font-medium">{messages.settings.appInstall.openInSafariTitle}</p>
              <p className="mt-1">{messages.settings.appInstall.openInSafariDescription}</p>
            </InfoBox>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            {messages.settings.appInstall.steps.map((step, index) => {
              const Icon = index === 0 ? Smartphone : index === 1 ? Share2 : SquarePlus;

              return (
                <div
                  key={step.title}
                  className="rounded-[var(--radius-xl)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--primary)]/12 text-[color:var(--primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[color:var(--foreground)]">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <InfoBox variant="primary" icon={<LayoutDashboard className="h-4 w-4 text-[color:var(--primary)]" />}>
            <p className="font-medium">{messages.settings.appInstall.dashboardLaunchTitle}</p>
            <p className="mt-1">{messages.settings.appInstall.dashboardLaunchDescription}</p>
          </InfoBox>

          <div className="flex flex-wrap gap-3">
            <Button render={<Link href={withLocalePrefix("/dashboard", locale)} />}>
              {messages.settings.appInstall.openDashboard}
            </Button>
            <Button
              variant="outline"
              render={<Link href={withLocalePrefix("/settings", locale)} />}
            >
              {messages.settings.appInstall.backToSettings}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
