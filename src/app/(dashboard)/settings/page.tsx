"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  AccessibleDialog,
  ErrorState,
  Input,
  Selectable,
  useToast,
} from "@/components/ui";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { reportClientError } from "@/lib/telemetry";
import {
  getEffectiveDisplayName,
  getEffectiveProfileImageSource,
} from "@/lib/userIdentity";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const toast = useToast();
  const user = useQuery(api.users.queries.getCurrentUser);
  const strava = useQuery(api.integrations.queries.getStravaStatus);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const disconnectStrava = useMutation(api.integrations.mutations.disconnectStrava);
  const deleteAccount = useMutation(api.users.mutations.deleteAccount);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);

  const accountType = useMemo(() => {
    if (user?.tier === "pro" || user?.tier === "premium") {
      return messages.settings.account.pro;
    }
    return messages.settings.account.free;
  }, [messages.settings.account.free, messages.settings.account.pro, user?.tier]);
  const effectiveDisplayName = getEffectiveDisplayName(
    user,
    messages.userMenu.fallbackUserName
  );
  const profileImageSource = getEffectiveProfileImageSource(user);
  const storedDisplayName =
    user &&
    "displayName" in user &&
    typeof user.displayName === "string"
      ? user.displayName
      : "";
  const editableDisplayName =
    storedDisplayName ||
    (effectiveDisplayName === messages.userMenu.fallbackUserName
      ? ""
      : effectiveDisplayName);

  useEffect(() => {
    setDisplayName(editableDisplayName);
  }, [editableDisplayName]);

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteAccount({});
      router.push(withLocalePrefix("/", locale));
    } catch (error) {
      setDeleteError(
        reportClientError(error, {
          area: "settings",
          action: "deleteAccount",
          operationType: "mutation",
          userMessage: messages.profile.dangerZone.deleteFailed,
        })
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveDisplayName = async () => {
    setDisplayNameError(null);
    setIsSavingDisplayName(true);
    try {
      await updateProfile({ displayName });
      toast.success({ description: messages.common.toasts.displayNameSaved });
    } catch (error) {
      setDisplayNameError(
        reportClientError(error, {
          area: "settings",
          action: "updateDisplayName",
          operationType: "mutation",
          userMessage: messages.settings.account.displayNameSaveFailed,
        })
      );
    } finally {
      setIsSavingDisplayName(false);
    }
  };

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
              <ProfilePhotoUpload source={profileImageSource} size="settings" />
              <div>
                <p className="font-semibold text-gray-900">
                  {effectiveDisplayName}
                </p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input
                label={messages.settings.account.displayNameLabel}
                placeholder={messages.settings.account.displayNamePlaceholder}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              {displayNameError ? <ErrorState description={displayNameError} /> : null}
              <Button
                variant="outline"
                onClick={() => void handleSaveDisplayName()}
                isLoading={isSavingDisplayName}
              >
                {messages.settings.account.saveDisplayName}
              </Button>
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
                  <Selectable
                    key={value}
                    onClick={() =>
                      void updateProfile({
                        unit_preference: value as "metric" | "imperial",
                      })
                    }
                    selected={(user?.unit_preference ?? "metric") === value}
                    variant="segment"
                    fullWidth={false}
                  >
                    {label}
                  </Selectable>
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

        <Card variant="bordered" className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">
              {messages.profile.dangerZone.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deleteError ? <ErrorState description={deleteError} /> : null}
            <p className="text-sm text-gray-600">
              {messages.profile.dangerZone.deleteConfirmDescription}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {messages.profile.dangerZone.deleteAccount}
            </Button>
          </CardContent>
        </Card>
      </div>

      <AccessibleDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title={messages.profile.dangerZone.deleteConfirmTitle}
        description={messages.profile.dangerZone.deleteConfirmDescription}
      >
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            {messages.profile.dangerZone.cancel}
          </Button>
          <Button
            onClick={() => {
              setShowDeleteDialog(false);
              void handleDeleteAccount();
            }}
            isLoading={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {messages.profile.dangerZone.deleteConfirmCta}
          </Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}
