"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, CardContent, InfoBox, SectionHeader } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { CheckCircle2, Share2, Smartphone } from "lucide-react";

function readInstallEnvironment() {
  if (typeof window === "undefined") {
    return {
      isAppleMobile: false,
      isSafari: false,
      isStandalone: false,
    };
  }

  const userAgent = navigator.userAgent;
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return {
    isAppleMobile: /iphone|ipad|ipod/i.test(userAgent),
    isSafari: /safari/i.test(userAgent) && !/(crios|fxios|edgios)/i.test(userAgent),
    isStandalone: Boolean(
      window.matchMedia("(display-mode: standalone)").matches ||
        navigatorWithStandalone.standalone
    ),
  };
}

export function IPhoneAppInstallCard() {
  const { locale, messages } = useDashboardMessages();
  const [environment, setEnvironment] = useState({
    isAppleMobile: false,
    isSafari: false,
    isStandalone: false,
  });

  useEffect(() => {
    setEnvironment(readInstallEnvironment());
  }, []);

  return (
    <Card variant="bordered" className="dashboard-card-surface">
      <SectionHeader
        icon={<Smartphone className="h-5 w-5 text-[color:var(--primary)]" />}
        title={messages.settings.appInstall.settingsTitle}
      />
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          {messages.settings.appInstall.settingsDescription}
        </p>

        {environment.isStandalone ? (
          <InfoBox
            variant="success"
            icon={<CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />}
          >
            <p className="font-medium">{messages.settings.appInstall.installedTitle}</p>
            <p className="mt-1">{messages.settings.appInstall.installedDescription}</p>
          </InfoBox>
        ) : environment.isAppleMobile && !environment.isSafari ? (
          <InfoBox
            variant="warning"
            icon={<Share2 className="h-4 w-4 text-[color:var(--warning)]" />}
          >
            <p className="font-medium">{messages.settings.appInstall.openInSafariTitle}</p>
            <p className="mt-1">{messages.settings.appInstall.openInSafariDescription}</p>
          </InfoBox>
        ) : (
          <InfoBox
            variant="primary"
            icon={<Smartphone className="h-4 w-4 text-[color:var(--primary)]" />}
          >
            <p className="font-medium">{messages.settings.appInstall.dashboardLaunchTitle}</p>
            <p className="mt-1">{messages.settings.appInstall.dashboardLaunchDescription}</p>
          </InfoBox>
        )}

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--border)] bg-[color:var(--secondary)]/35 p-4">
          <p className="text-sm font-semibold text-[color:var(--foreground)]">
            {messages.settings.appInstall.quickStepsTitle}
          </p>
          <ol className="mt-3 space-y-2 text-sm text-[color:var(--muted-foreground)]">
            {messages.settings.appInstall.steps.map((step, index) => (
              <li key={step.title}>
                <span className="font-medium text-[color:var(--foreground)]">
                  {index + 1}. {step.title}
                </span>{" "}
                {step.description}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button render={<Link href={withLocalePrefix("/app", locale)} />}>
            {messages.settings.appInstall.openInstallPage}
          </Button>
          <Button
            variant="outline"
            render={<Link href={withLocalePrefix("/dashboard", locale)} />}
          >
            {messages.settings.appInstall.openDashboard}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
