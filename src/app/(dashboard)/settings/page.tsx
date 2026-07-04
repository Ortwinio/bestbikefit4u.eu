"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  Button,
  AccessibleDialog,
  ErrorState,
  Input,
  RadioGroup,
  Selectable,
  useToast,
  SectionHeader,
  InfoBox,
  StatRow,
} from "@/components/ui";
import { StravaBikeImportSection } from "@/components/settings/StravaBikeImportSection";
import { IPhoneAppInstallCard } from "@/components/settings/IPhoneAppInstallCard";
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
import { CheckCircle2, Trash2, User, Palette, Zap, Shield, AlertCircle, Info, CreditCard } from "lucide-react";

function linkButtonProps(href: string) {
  return {
    render: <Link href={href} />,
    nativeButton: false as const,
  };
}

// Separate component so useSearchParams() is inside a Suspense boundary
function StravaCallbackToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, messages } = useDashboardMessages();
  const toast = useToast();

  useEffect(() => {
    const stravaParam = searchParams?.get("strava");
    if (!stravaParam) return;
    router.replace(withLocalePrefix("/settings", locale));
    if (stravaParam === "connected") {
      toast.success({ description: messages.settings.integrations.callback.connected });
    } else if (stravaParam === "denied") {
      toast.info({ description: messages.settings.integrations.callback.denied });
    } else if (stravaParam === "error") {
      toast.error({ description: messages.settings.integrations.callback.error });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { locale, messages, languageSwitchLabels } = useDashboardMessages();
  const toast = useToast();
  const user = useQuery(api.users.queries.getCurrentUser);
  const strava = useQuery(api.integrations.queries.getStravaStatus);
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const initiateStravaConnect = useAction(api.integrations.actions.initiateStravaConnect);
  const disconnectStravaAction = useAction(api.integrations.actions.disconnectStravaAction);
  const deleteAccount = useMutation(api.users.mutations.deleteAccount);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [showStravaConsentInline, setShowStravaConsentInline] = useState(false);
  const [showStravaDisconnect, setShowStravaDisconnect] = useState(false);
  const [isConnectingStrava, setIsConnectingStrava] = useState(false);
  const [isDisconnectingStrava, setIsDisconnectingStrava] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [billingPortalError, setBillingPortalError] = useState<string | null>(null);
  const [isOpeningBillingPortal, setIsOpeningBillingPortal] = useState(false);

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
  const localeLabel = locale === "nl" ? languageSwitchLabels.dutch : languageSwitchLabels.english;
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
  const isPaidUser = user?.tier === "pro" || user?.tier === "premium";

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

  const handleOpenBillingPortal = async () => {
    setBillingPortalError(null);
    setIsOpeningBillingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? messages.settings.billing.portalUnavailable);
      }

      window.location.href = payload.url;
    } catch (error) {
      const description =
        error instanceof Error ? error.message : messages.settings.billing.portalUnavailable;
      setBillingPortalError(description);
      toast.error({ description });
    } finally {
      setIsOpeningBillingPortal(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-[color:var(--foreground)]">
      <Suspense>
        <StravaCallbackToast />
      </Suspense>
      <Card variant="bordered" className="dashboard-hero-surface overflow-hidden">
        <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-end">
          <div className="space-y-4">
            <SectionHeader
              icon={<User className="h-5 w-5 text-[color:var(--primary)]" />}
              title={messages.settings.title}
            />
            <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted-foreground)]">
              {messages.settings.subtitle}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                variant="outline"
                {...linkButtonProps(withLocalePrefix("/profile", locale))}
                className="w-full justify-center sm:w-auto"
              >
                {messages.settings.privacy.manageProfile}
              </Button>
              <Button
                variant="ghost"
                {...linkButtonProps(withLocalePrefix("/privacy", locale))}
                className="w-full justify-center sm:w-auto"
              >
                {messages.settings.privacy.privacyPolicy}
              </Button>
            </div>
          </div>

          <div className="dashboard-card-surface-muted rounded-[var(--radius-2xl)] border p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]">
              {messages.settings.account.title}
            </p>
            <dl className="mt-3 divide-y divide-[color:var(--border)]">
              <StatRow label={messages.settings.account.type} value={accountType} />
              <StatRow label={messages.settings.account.displayNameLabel} value={effectiveDisplayName} />
              <StatRow label={messages.settings.preferences.language} value={localeLabel} />
            </dl>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="bordered" className="dashboard-card-surface">
          <SectionHeader
            icon={<User className="h-5 w-5 text-[color:var(--primary)]" />}
            title={messages.settings.account.title}
          />
          <CardContent className="space-y-4">
            <div className="dashboard-card-surface-muted flex items-center gap-4 rounded-[var(--radius-2xl)] border p-4">
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
                onClick={() => void handleSaveDisplayName()}
                isLoading={isSavingDisplayName}
              >
                {messages.settings.account.saveDisplayName}
              </Button>
            </div>
            <dl className="divide-y divide-[color:var(--border)]">
              <StatRow label={messages.settings.account.type} value={accountType} />
            </dl>
            {user?.tier !== "pro" && user?.tier !== "premium" ? (
              <InfoBox variant="warning" icon={<AlertCircle className="h-4 w-4 text-[color:var(--warning)]" />}>
                <p className="font-medium">{messages.settings.account.upgrade}</p>
                <p className="mt-1">{messages.settings.account.upgradeDescription}</p>
                <Button
                  variant="outline"
                  {...linkButtonProps(withLocalePrefix("/pricing", locale))}
                  className="mt-3 w-full justify-center sm:w-auto"
                >
                  {messages.settings.account.upgradeCta}
                </Button>
              </InfoBox>
            ) : null}
            {isPaidUser ? (
              <InfoBox
                variant={user?.stripeCustomerId ? "secondary" : "warning"}
                icon={<CreditCard className="h-4 w-4 text-[color:var(--primary)]" />}
              >
                <p className="font-medium">{messages.settings.billing.title}</p>
                <p className="mt-1">
                  {user?.stripeCustomerId
                    ? messages.settings.billing.description
                    : messages.settings.billing.missingCustomer}
                </p>
                {billingPortalError ? (
                  <ErrorState description={billingPortalError} />
                ) : null}
                {user?.stripeCustomerId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleOpenBillingPortal()}
                    isLoading={isOpeningBillingPortal}
                    className="mt-3 w-full justify-center sm:w-auto"
                  >
                    {messages.settings.billing.manageCta}
                  </Button>
                ) : null}
              </InfoBox>
            ) : (
              <InfoBox variant="secondary" icon={<CreditCard className="h-4 w-4 text-[color:var(--primary)]" />}>
                <p className="font-medium">{messages.settings.billing.title}</p>
                <p className="mt-1">{messages.settings.billing.noPaidSubscription}</p>
              </InfoBox>
            )}
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                router.push(withLocalePrefix("/", locale));
              }}
              className="w-full justify-start"
            >
              {messages.common.signOut}
            </Button>
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <SectionHeader
            icon={<Palette className="h-5 w-5 text-[color:var(--primary)]" />}
            title={messages.settings.preferences.title}
          />
          <CardContent className="space-y-5">
            <div className="dashboard-card-surface-muted rounded-[var(--radius-2xl)] border p-4">
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground)]">
                {messages.settings.preferences.language}
              </p>
              <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
            </div>
            <div className="dashboard-card-surface-muted rounded-[var(--radius-2xl)] border p-4">
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
            <div className="dashboard-card-surface-muted rounded-[var(--radius-2xl)] border p-4">
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground)]">
                {messages.settings.preferences.units}
              </p>
              <RadioGroup
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

        <IPhoneAppInstallCard />

        <Card variant="bordered" className="dashboard-card-surface">
          <SectionHeader
            icon={<Zap className="h-5 w-5 text-[color:var(--primary)]" />}
            title={messages.settings.integrations.title}
          />
          <CardContent className="space-y-4">
            <InfoBox variant="secondary" className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[color:var(--foreground)]">
                    {messages.settings.integrations.strava}
                  </p>
                  <p className="mt-1 text-sm text-[color:var(--muted-foreground)]">
                    {messages.settings.integrations.stravaDescription}
                  </p>
                </div>
                {strava?.accessStatus === "active" ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    className="shrink-0"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[color:var(--success)]" />
                    {messages.settings.integrations.connected}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setShowStravaConsentInline((current) => !current)}
                    isLoading={isConnectingStrava}
                    className="shrink-0"
                  >
                    {strava?.accessStatus === "error"
                      ? messages.settings.integrations.reconnect
                      : messages.settings.integrations.connectStrava}
                  </Button>
                )}
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

              <StravaBikeImportSection
                id="strava-bike-import"
                strava={strava}
              />

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-3">
                {strava?.accessStatus === "active" ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setShowStravaDisconnect(true)}
                    >
                      {messages.settings.integrations.disconnectStrava}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        document
                          .getElementById("strava-bike-import")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {messages.settings.integrations.importStravaData}
                    </Button>
                  </>
                ) : null}
              </div>

              {strava?.accessStatus !== "active" && showStravaConsentInline ? (
                <InfoBox variant="primary" icon={<Info className="h-4 w-4 text-[color:var(--primary)]" />} className="mt-4">
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-[color:var(--foreground)]">
                        {messages.settings.integrations.consent.title}
                      </p>
                      <p className="mt-1 text-[color:var(--muted-foreground)]">
                        {messages.settings.integrations.consent.howWeUseDescription}
                      </p>
                    </div>
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
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowStravaConsentInline(false)}
                    >
                      {messages.settings.integrations.consent.cancel}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowStravaConsentInline(false);
                        void handleConnectStrava();
                      }}
                      isLoading={isConnectingStrava}
                    >
                      {messages.settings.integrations.consent.confirm}
                    </Button>
                  </div>
                </InfoBox>
              ) : null}
            </InfoBox>
          </CardContent>
        </Card>

        <Card variant="bordered" className="dashboard-card-surface">
          <SectionHeader
            icon={<Shield className="h-5 w-5 text-[color:var(--primary)]" />}
            title={messages.settings.privacy.title}
          />
          <CardContent className="space-y-2 text-sm text-[color:var(--muted-foreground)]">
            <p>{messages.settings.privacy.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="ghost"
                {...linkButtonProps(withLocalePrefix("/privacy", locale))}
                className="px-0 text-[color:var(--primary)]"
              >
                {messages.settings.privacy.privacyPolicy}
              </Button>
              <Button
                variant="ghost"
                {...linkButtonProps(withLocalePrefix("/terms", locale))}
                className="px-0 text-[color:var(--primary)]"
              >
                {messages.settings.privacy.terms}
              </Button>
              <Button
                variant="ghost"
                {...linkButtonProps(withLocalePrefix("/profile", locale))}
                className="px-0 text-[color:var(--primary)]"
              >
                {messages.settings.privacy.manageProfile}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          variant="bordered"
          className="dashboard-card-surface border-[color:color-mix(in_oklch,var(--destructive)_28%,var(--border))]"
        >
          <SectionHeader
            icon={<Trash2 className="h-5 w-5 text-[color:var(--destructive)]" />}
            title={messages.profile.dangerZone.title}
          />
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
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteConfirmInput("");
        }}
        title={messages.profile.dangerZone.deleteConfirmTitle}
        description={messages.profile.dangerZone.deleteConfirmDescription}
      >
        <div className="mt-4 space-y-4">
          <Input
            label={messages.profile.dangerZone.deleteConfirmInputLabel}
            placeholder={messages.profile.dangerZone.deleteConfirmInputPlaceholder}
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmInput("");
              }}
            >
              {messages.profile.dangerZone.cancel}
            </Button>
            <Button
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirmInput("");
                void handleDeleteAccount();
              }}
              isLoading={isDeleting}
              variant="destructive"
              disabled={deleteConfirmInput !== messages.profile.dangerZone.deleteConfirmWord}
            >
              {messages.profile.dangerZone.deleteConfirmCta}
            </Button>
          </div>
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
    </div>
  );
}
