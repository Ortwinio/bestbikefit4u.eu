"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { RadioGroup } from "@base-ui/react/radio-group";
import { useAction, useMutation, useQuery } from "convex/react";
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
import { CheckCircle2, Trash2, XCircle } from "lucide-react";

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const toast = useToast();
  const user = useQuery(api.users.queries.getCurrentUser);
  const strava = useQuery(api.integrations.queries.getStravaStatus);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const importStravaPhoto = useMutation(api.integrations.mutations.importStravaPhoto);
  const initiateStravaConnect = useAction(api.integrations.actions.initiateStravaConnect);
  const disconnectStravaAction = useAction(api.integrations.actions.disconnectStravaAction);
  const deleteAccount = useMutation(api.users.mutations.deleteAccount);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showStravaConsent, setShowStravaConsent] = useState(false);
  const [showStravaDisconnect, setShowStravaDisconnect] = useState(false);
  const [showStravaPhotoConfirm, setShowStravaPhotoConfirm] = useState(false);
  const [isConnectingStrava, setIsConnectingStrava] = useState(false);
  const [isDisconnectingStrava, setIsDisconnectingStrava] = useState(false);
  const [isImportingStravaPhoto, setIsImportingStravaPhoto] = useState(false);
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

  useEffect(() => {
    const stravaParam = searchParams?.get("strava");
    if (!stravaParam) return;
    // Clean the URL immediately so refreshing doesn't re-show the toast
    const cleanUrl = withLocalePrefix("/settings", locale);
    router.replace(cleanUrl);
    if (stravaParam === "connected") {
      toast.success({ description: messages.settings.integrations.callback.connected });
    } else if (stravaParam === "denied") {
      toast.info({ description: messages.settings.integrations.callback.denied });
    } else if (stravaParam === "error") {
      toast.error({ description: messages.settings.integrations.callback.error });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleConnectStrava = async () => {
    setIsConnectingStrava(true);
    try {
      const url = await initiateStravaConnect({});
      window.location.href = url;
    } catch {
      toast.error({ description: "Could not start Strava connection. Please try again." });
      setIsConnectingStrava(false);
    }
  };

  const handleDisconnectStrava = async () => {
    setIsDisconnectingStrava(true);
    try {
      await disconnectStravaAction({});
      setShowStravaDisconnect(false);
    } catch {
      toast.error({ description: messages.settings.integrations.callback.error });
    } finally {
      setIsDisconnectingStrava(false);
    }
  };

  const handleImportStravaPhoto = async () => {
    setIsImportingStravaPhoto(true);
    try {
      await importStravaPhoto({});
      setShowStravaPhotoConfirm(false);
      toast.success({ description: messages.settings.integrations.photoImport.confirm });
    } catch {
      toast.error({ description: messages.settings.integrations.callback.error });
    } finally {
      setIsImportingStravaPhoto(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-[color:var(--foreground)]">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--foreground)]">{messages.settings.title}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">{messages.settings.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.settings.account.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <ProfilePhotoUpload source={profileImageSource} size="settings" />
              <div>
                <p className="font-semibold text-[color:var(--foreground)]">
                  {effectiveDisplayName}
                </p>
                <p className="text-sm text-[color:var(--muted-foreground)]">{user?.email}</p>
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
            <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-3">
              <span className="text-sm text-[color:var(--muted-foreground)]">{messages.settings.account.type}</span>
              <span className="rounded-full bg-[color:var(--primary)] px-3 py-1 text-xs font-semibold text-[color:var(--primary-foreground)]">
                {accountType}
              </span>
            </div>
            {user?.tier !== "pro" && user?.tier !== "premium" ? (
              <div className="rounded-[var(--radius-md)] border border-[color:color-mix(in_oklch,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--warning)_12%,var(--card)_88%)] px-4 py-3 text-sm text-[color:var(--warning-foreground)]">
                <p className="font-medium">{messages.settings.account.upgrade}</p>
                <p className="mt-1">{messages.settings.account.upgradeDescription}</p>
                <Link
                  href={withLocalePrefix("/pricing", locale)}
                  className="mt-3 inline-flex font-semibold text-[color:var(--warning-foreground)] underline"
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

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.settings.preferences.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground)]">
                {messages.settings.preferences.language}
              </p>
              <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground)]">
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
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground)]">
                {messages.settings.preferences.units}
              </p>
              <RadioGroup<string>
                aria-label={messages.settings.preferences.units}
                className="flex flex-wrap gap-2"
                value={user?.unit_preference ?? "metric"}
                onValueChange={(nextValue) =>
                  void updateProfile({
                    unit_preference: nextValue as "metric" | "imperial",
                  })
                }
              >
                {[
                  ["metric", messages.settings.preferences.metric],
                  ["imperial", messages.settings.preferences.imperial],
                ].map(([value, label]) => (
                  <Selectable
                    key={value}
                    mode="radio"
                    value={value}
                    variant="segment"
                    fullWidth={false}
                  >
                    {label}
                  </Selectable>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.settings.integrations.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--secondary)] px-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">
                    {messages.settings.integrations.strava}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {messages.settings.integrations.stravaDescription}
                  </p>
                </div>
                {/* Status badge */}
                <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-1 text-xs font-semibold shadow-sm">
                  {strava?.accessStatus === "active" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[color:var(--success,green)]" />
                      <span className="text-[color:var(--foreground)]">{messages.settings.integrations.connected}</span>
                    </>
                  ) : strava?.accessStatus === "error" ? (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-[color:var(--destructive)]" />
                      <span className="text-[color:var(--destructive)]">{messages.settings.integrations.error}</span>
                    </>
                  ) : strava?.accessStatus === "pending" ? (
                    <span className="text-[color:var(--muted-foreground)]">{messages.settings.integrations.pending}</span>
                  ) : (
                    <span className="text-[color:var(--muted-foreground)]">{messages.settings.integrations.available}</span>
                  )}
                </span>
              </div>

              {/* Connected state: athlete info */}
              {strava?.accessStatus === "active" && strava.athleteName ? (
                <div className="mt-3 flex items-center gap-3">
                  {strava.athleteAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={strava.athleteAvatarUrl}
                      alt={strava.athleteName}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{strava.athleteName}</p>
                    {strava.lastSyncAt ? (
                      <p className="text-xs text-[color:var(--muted-foreground)]">
                        {messages.settings.integrations.lastSynced}:{" "}
                        {new Date(strava.lastSyncAt).toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-3">
                {strava?.accessStatus === "active" ? (
                  <>
                    {strava.athleteAvatarUrl ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowStravaPhotoConfirm(true)}
                      >
                        {messages.settings.integrations.photoImport.importButton}
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      onClick={() => setShowStravaDisconnect(true)}
                    >
                      {messages.settings.integrations.disconnectStrava}
                    </Button>
                  </>
                ) : strava?.accessStatus === "error" ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowStravaConsent(true)}
                    isLoading={isConnectingStrava}
                  >
                    {messages.settings.integrations.reconnect}
                  </Button>
                ) : strava?.accessStatus === "pending" ? (
                  <Button variant="outline" disabled>
                    {messages.settings.integrations.pending}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowStravaConsent(true)}
                    isLoading={isConnectingStrava}
                  >
                    {messages.settings.integrations.connectStrava}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <CardHeader>
            <CardTitle>{messages.settings.privacy.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
            <p>{messages.settings.privacy.description}</p>
            <div className="flex flex-wrap gap-4">
              <Link href={withLocalePrefix("/privacy", locale)} className="font-semibold text-[color:var(--primary)]">
                {messages.settings.privacy.privacyPolicy}
              </Link>
              <Link href={withLocalePrefix("/terms", locale)} className="font-semibold text-[color:var(--primary)]">
                {messages.settings.privacy.terms}
              </Link>
              <Link href={withLocalePrefix("/profile", locale)} className="font-semibold text-[color:var(--primary)]">
                {messages.settings.privacy.manageProfile}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card
          variant="bordered"
          className="dashboard-card-surface border-[color:color-mix(in_oklch,var(--destructive)_28%,var(--border))]"
        >
          <CardHeader>
            <CardTitle className="text-[color:var(--destructive)]">
              {messages.profile.dangerZone.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deleteError ? <ErrorState description={deleteError} /> : null}
            <p className="text-sm text-[color:var(--muted-foreground)]">
              {messages.profile.dangerZone.deleteConfirmDescription}
            </p>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              className="border-[color:var(--destructive)] text-[color:var(--destructive)] hover:bg-[color:color-mix(in_oklch,var(--destructive)_10%,var(--card)_90%)]"
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
            variant="destructive"
          >
            {messages.profile.dangerZone.deleteConfirmCta}
          </Button>
        </div>
      </AccessibleDialog>

      {/* Strava consent modal */}
      <AccessibleDialog
        open={showStravaConsent}
        onClose={() => setShowStravaConsent(false)}
        title={messages.settings.integrations.consent.title}
        description={messages.settings.integrations.consent.howWeUseDescription}
      >
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-[color:var(--foreground)]">
              {messages.settings.integrations.consent.whatWeAccess}
            </p>
            <ul className="mt-2 space-y-1 text-[color:var(--muted-foreground)]">
              <li>✓ {messages.settings.integrations.consent.accessProfile}</li>
              <li>✓ {messages.settings.integrations.consent.accessActivities}</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--foreground)]">
              {messages.settings.integrations.consent.whatWeDoNot}
            </p>
            <ul className="mt-2 space-y-1 text-[color:var(--muted-foreground)]">
              <li>✗ {messages.settings.integrations.consent.noGps}</li>
              <li>✗ {messages.settings.integrations.consent.noNotes}</li>
              <li>✗ {messages.settings.integrations.consent.noSocial}</li>
              <li>✗ {messages.settings.integrations.consent.noSegments}</li>
            </ul>
          </div>
          <p className="text-[color:var(--muted-foreground)]">
            {messages.settings.integrations.consent.dataNote}
          </p>
        </div>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={() => setShowStravaConsent(false)}>
            {messages.settings.integrations.consent.cancel}
          </Button>
          <Button
            onClick={() => {
              setShowStravaConsent(false);
              void handleConnectStrava();
            }}
            isLoading={isConnectingStrava}
          >
            {messages.settings.integrations.consent.confirm}
          </Button>
        </div>
      </AccessibleDialog>

      {/* Strava disconnect confirmation */}
      <AccessibleDialog
        open={showStravaDisconnect}
        onClose={() => setShowStravaDisconnect(false)}
        title={messages.settings.integrations.disconnectConfirm.title}
        description={messages.settings.integrations.disconnectConfirm.body}
      >
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => setShowStravaDisconnect(false)}>
            {messages.settings.integrations.disconnectConfirm.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={() => void handleDisconnectStrava()}
            isLoading={isDisconnectingStrava}
          >
            {messages.settings.integrations.disconnectConfirm.confirm}
          </Button>
        </div>
      </AccessibleDialog>

      {/* Strava photo import confirmation */}
      <AccessibleDialog
        open={showStravaPhotoConfirm}
        onClose={() => setShowStravaPhotoConfirm(false)}
        title={messages.settings.integrations.photoImport.confirmTitle}
        description={messages.settings.integrations.photoImport.confirmBody}
      >
        {strava?.athleteAvatarUrl ? (
          <div className="mt-3 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={strava.athleteAvatarUrl}
              alt={strava.athleteName ?? "Strava"}
              className="h-20 w-20 rounded-full object-cover"
            />
          </div>
        ) : null}
        <div className="mt-4 flex gap-3">
          <Button variant="outline" onClick={() => setShowStravaPhotoConfirm(false)}>
            {messages.settings.integrations.photoImport.cancel}
          </Button>
          <Button
            onClick={() => void handleImportStravaPhoto()}
            isLoading={isImportingStravaPhoto}
          >
            {messages.settings.integrations.photoImport.confirm}
          </Button>
        </div>
      </AccessibleDialog>
    </div>
  );
}
