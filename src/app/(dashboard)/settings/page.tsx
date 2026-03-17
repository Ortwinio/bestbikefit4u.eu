"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const user = useQuery(api.users.queries.getCurrentUser);
  const strava = useQuery(api.integrations.queries.getStravaStatus);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const disconnectStrava = useMutation(api.integrations.mutations.disconnectStrava);

  const accountType = useMemo(() => {
    if (user?.tier === "pro" || user?.tier === "premium") {
      return messages.settings.account.pro;
    }
    return messages.settings.account.free;
  }, [messages.settings.account.free, messages.settings.account.pro, user?.tier]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{messages.settings.title}</h1>
        <p className="mt-2 text-sm text-gray-600">{messages.settings.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.settings.account.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <ProfilePhotoUpload storageId={user?.profile_image_url} size="settings" />
              <div>
                <p className="font-semibold text-gray-900">
                  {user?.name || user?.email?.split("@")[0] || messages.userMenu.fallbackUserName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[color:var(--secondary)] px-4 py-3">
              <span className="text-sm text-gray-700">{messages.settings.account.type}</span>
              <span className="rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-foreground)]">
                {accountType}
              </span>
            </div>
            {user?.tier !== "pro" && user?.tier !== "premium" ? (
              <div className="rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-medium">{messages.settings.account.upgrade}</p>
                <p className="mt-1">{messages.settings.account.upgradeDescription}</p>
                <Link
                  href={withLocalePrefix("/pricing", locale)}
                  className="mt-3 inline-flex font-semibold text-amber-900 underline"
                >
                  {messages.settings.account.upgradeCta}
                </Link>
              </div>
            ) : null}
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                router.push(withLocalePrefix("/", locale));
              }}
            >
              {messages.common.signOut}
            </Button>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.settings.preferences.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                {messages.settings.preferences.language}
              </p>
              <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                {messages.settings.preferences.appearance}
              </p>
              <ThemeToggle
                labels={{
                  light: messages.settings.preferences.light,
                  dark: messages.settings.preferences.dark,
                  system: messages.settings.preferences.system,
                }}
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">
                {messages.settings.preferences.units}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["metric", messages.settings.preferences.metric],
                  ["imperial", messages.settings.preferences.imperial],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      void updateProfile({
                        unit_preference: value as "metric" | "imperial",
                      })
                    }
                    className={`rounded-[var(--radius-md)] border px-3 py-2 text-sm font-medium ${
                      (user?.unit_preference ?? "metric") === value
                        ? "border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                        : "border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--foreground)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.settings.integrations.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {messages.settings.integrations.strava}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {messages.settings.integrations.stravaDescription}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                  {user?.tier === "pro" || user?.tier === "premium"
                    ? strava?.accessStatus === "active"
                      ? messages.settings.integrations.connected
                      : messages.settings.integrations.available
                    : messages.settings.integrations.proOnly}
                </span>
              </div>
              {user?.tier === "pro" || user?.tier === "premium" ? (
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" disabled>
                    {messages.settings.integrations.connectStrava}
                  </Button>
                  {strava?.accessStatus === "active" ? (
                    <Button variant="ghost" onClick={() => void disconnectStrava({})}>
                      {messages.settings.integrations.disconnectStrava}
                    </Button>
                  ) : null}
                </div>
              ) : (
                <Link
                  href={withLocalePrefix("/pricing", locale)}
                  className="mt-4 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  {messages.settings.account.upgradeCta}
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>{messages.settings.privacy.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>{messages.settings.privacy.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={withLocalePrefix("/privacy", locale)} className="font-semibold text-blue-700">
                {messages.settings.privacy.privacyPolicy}
              </Link>
              <Link href={withLocalePrefix("/terms", locale)} className="font-semibold text-blue-700">
                {messages.settings.privacy.terms}
              </Link>
              <Link href={withLocalePrefix("/profile", locale)} className="font-semibold text-blue-700">
                {messages.settings.privacy.manageProfile}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
