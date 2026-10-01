"use client";

import { SettingsNameField, SettingsUnitsField } from "./SettingsAutosaveFields";
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
  useToast,
  SectionHeader,
  InfoBox,
  StatRow,
  LoadingState,
} from "@/components/ui";
import { toolsSettings } from "@/i18n/account/toolsSettings";
import { StravaBikeImportSection } from "@/components/settings/StravaBikeImportSection";
import { IPhoneAppInstallCard } from "@/components/settings/IPhoneAppInstallCard";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { ProfilePhotoUpload } from "@/components/profile/ProfilePhotoUpload";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { reportClientError } from "@/lib/telemetry";
import { localizeAccountError } from "@/i18n/account/clientErrors";
import { getSettingsLanguage } from "@/i18n/account/settingsLanguage";
import { getEffectiveDisplayName, getEffectiveProfileImageSource } from "@/lib/userIdentity";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { isStripeBillingEnabled } from "@/config/billing";
import {
  CheckCircle2,
  Trash2,
  User,
  Palette,
  Zap,
  Shield,
  AlertCircle,
  Info,
  CreditCard,
} from "lucide-react";

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
  const { locale, messages: baseMessages, languageSwitchLabels } = useDashboardMessages();
  const messages = useMemo(() => getSettingsLanguage(baseMessages, locale), [baseMessages, locale]);
  const toast = useToast();
  const copy = toolsSettings[locale];
  const user = useQuery(api.users.queries.getCurrentUser);
  const strava = useQuery(api.integrations.queries.getStravaStatus);
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
  const [billingPortalError, setBillingPortalError] = useState<string | null>(null);
  const [isOpeningBillingPortal, setIsOpeningBillingPortal] = useState(false);

  const accountType = useMemo(() => {
    if (user?.tier === "pro" || user?.tier === "premium") {
      return messages.settings.account.pro;
    }
    return messages.settings.account.free;
  }, [messages.settings.account.free, messages.settings.account.pro, user?.tier]);
  const effectiveDisplayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const profileImageSource = getEffectiveProfileImageSource(user);
  const storedDisplayName =
    user && "displayName" in user && typeof user.displayName === "string" ? user.displayName : "";
  const editableDisplayName =
    storedDisplayName ||
    (effectiveDisplayName === messages.userMenu.fallbackUserName ? "" : effectiveDisplayName);
  const isPaidUser = user?.tier === "pro" || user?.tier === "premium";


  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteAccount({});
      router.push(withLocalePrefix("/", locale));
    } catch (error) {
      setDeleteError(
        localizeAccountError(reportClientError(error, {
          area: "settings",
          action: "deleteAccount",
          operationType: "mutation",
          userMessage: messages.profile.dangerZone.deleteFailed,
        }), locale),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConnectStrava = async () => {
    setIsConnectingStrava(true);
    try {
      const url = await initiateStravaConnect({});
      window.location.href = url;
    } catch {
      toast.error({ description: copy.connectError });
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
        locale === "en" && error instanceof Error ? error.message : messages.settings.billing.portalUnavailable;
      setBillingPortalError(description);
      toast.error({ description });
    } finally {
      setIsOpeningBillingPortal(false);
    }
  };

  if (user === undefined) return <LoadingState label={copy.loading} />;
  if (user === null)
    return (
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <p>{copy.missing}</p>
        <Button {...linkButtonProps(withLocalePrefix("/login", locale))}>{copy.login}</Button>
      </div>
    );

  return (
    <div
      className={
        "mx-auto max-w-6xl space-y-7 text-foreground [&_h2]:font-display [&_h2]:text-2xl " +
        "[&_div.border]:border-border [&_.border-b]:border-border " +
        "[&_[data-slot=card]]:border-border"
      }
    >
      <Suspense>
        <StravaCallbackToast />
      </Suspense>
      <header className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">{copy.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <Card variant="bordered" className="rounded-3xl border-border bg-card shadow-none">
            <SectionHeader
              icon={<User className="h-5 w-5 text-primary" />}
              title={messages.settings.account.title}
            />
            <CardContent className="space-y-4">
              <div className="bg-muted/40 flex items-center gap-4 rounded-2xl border border-border p-4">
                <ProfilePhotoUpload source={profileImageSource} size="settings" />
                <div>
                  <p className="font-semibold text-foreground">
                    {effectiveDisplayName}
                  </p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <SettingsNameField key={user?._id} initialValue={editableDisplayName} />
              <dl className="divide-y divide-[color:var(--border)]">
                <StatRow label={messages.settings.account.type} value={accountType} />
              </dl>
              <Button
                variant="link"
                onClick={async () => {
                  await signOut();
                  router.push(withLocalePrefix("/", locale));
                }}
                className="w-full justify-start bg-transparent hover:bg-muted"
              >
                {messages.common.signOut}
              </Button>
            </CardContent>
          </Card>
          <Card variant="bordered" className="rounded-3xl border-border bg-card shadow-none">
            <SectionHeader title={copy.subscription} />
            <CardContent className="space-y-4">
              {!isPaidUser && !isStripeBillingEnabled() ? (
                <InfoBox
                  variant="secondary"
                  icon={<Info className="h-4 w-4 text-primary" />}
                >
                  <p className="font-medium">{copy.paused}</p>
                  <p className="mt-1">{copy.pausedDescription}</p>
                </InfoBox>
              ) : !isPaidUser ? (
                <InfoBox
                  variant="warning"
                  icon={<AlertCircle className="h-4 w-4 text-warning" />}
                >
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
                  icon={<CreditCard className="h-4 w-4 text-primary" />}
                >
                  <p className="font-medium">{messages.settings.billing.title}</p>
                  <p className="mt-1">
                    {user?.stripeCustomerId
                      ? messages.settings.billing.description
                      : messages.settings.billing.missingCustomer}
                  </p>
                  {billingPortalError ? <ErrorState title={locale === "nl" ? copy.errorTitle : undefined}
                    description={billingPortalError} /> : null}
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
                <InfoBox
                  variant="secondary"
                  icon={<CreditCard className="h-4 w-4 text-primary" />}
                >
                  <p className="font-medium">{messages.settings.billing.title}</p>
                  <p className="mt-1">{messages.settings.billing.noPaidSubscription}</p>
                </InfoBox>
              )}
            </CardContent>
          </Card>
          <IPhoneAppInstallCard />
        </div>
        <div className="min-w-0 space-y-6">
          <Card variant="bordered" className="rounded-3xl border-border bg-card shadow-none">
            <SectionHeader
              icon={<Palette className="h-5 w-5 text-primary" />}
              title={messages.settings.preferences.title}
            />
            <CardContent className="space-y-5">
              <div className="bg-muted/40 rounded-2xl border border-border p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  {messages.settings.preferences.language}
                </p>
                <LanguageSwitch locale={locale} labels={languageSwitchLabels} />
              </div>
              <div className="bg-muted/40 rounded-2xl border border-border p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  {messages.settings.preferences.appearance}
                </p>
                <div className="[&_[data-slot=segmented-control]]:flex [&_[data-slot=segmented-control]]:flex-wrap">
                  <ThemeToggle
                    showSaveStatus
                    locale={locale}
                    ariaLabel={messages.settings.preferences.appearance}
                    labels={{
                      light: messages.settings.preferences.light,
                      dark: messages.settings.preferences.dark,
                      system: messages.settings.preferences.system,
                    }}
                  />
                </div>
              </div>
              <div className="bg-muted/40 rounded-2xl border border-border p-4">
                <p className="mb-2 text-sm font-medium text-foreground">
                  {messages.settings.preferences.units}
                </p>
                <SettingsUnitsField key={user?._id} initialValue={user?.unit_preference ?? "metric"} />
              </div>
            </CardContent>
          </Card>
          <Card variant="bordered" className="rounded-3xl border-border bg-card shadow-none">
            <SectionHeader
              icon={<Zap className="h-5 w-5 text-primary" />}
              title={messages.settings.integrations.title}
            />
            <CardContent className="space-y-4">
              <InfoBox variant="secondary" className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {messages.settings.integrations.strava}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {messages.settings.integrations.stravaDescription}
                    </p>
                  </div>
                  {strava?.accessStatus === "active" ? (
                    <Button type="button" variant="outline" disabled className="shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-success-text" />
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
                      <p className="text-sm font-medium text-foreground">
                        {strava.athleteName}
                      </p>
                      {strava.lastSyncAt ? (
                        <p className="text-xs text-muted-foreground">
                          {messages.settings.integrations.lastSynced}:{" "}
                          {new Date(strava.lastSyncAt).toLocaleString()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <StravaBikeImportSection id="strava-bike-import" strava={strava} />

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {strava?.accessStatus === "active" ? (
                    <>
                      <Button variant="outline" onClick={() => setShowStravaDisconnect(true)}>
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
                  <InfoBox
                    variant="primary"
                    icon={<Info className="h-4 w-4 text-primary" />}
                    className="mt-4"
                  >
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="font-semibold text-foreground">
                          {messages.settings.integrations.consent.title}
                        </p>
                        <p className="mt-1 text-muted-foreground">
                          {messages.settings.integrations.consent.howWeUseDescription}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {messages.settings.integrations.consent.whatWeAccess}
                        </p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>✓ {messages.settings.integrations.consent.accessProfile}</li>
                          <li>✓ {messages.settings.integrations.consent.accessActivities}</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {messages.settings.integrations.consent.whatWeDoNot}
                        </p>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>✗ {messages.settings.integrations.consent.noGps}</li>
                          <li>✗ {messages.settings.integrations.consent.noNotes}</li>
                          <li>✗ {messages.settings.integrations.consent.noSocial}</li>
                          <li>✗ {messages.settings.integrations.consent.noSegments}</li>
                        </ul>
                      </div>
                      <p className="text-muted-foreground">
                        {messages.settings.integrations.consent.dataNote}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => setShowStravaConsentInline(false)}>
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
          <Card variant="bordered" className="rounded-3xl border-border bg-card shadow-none">
            <SectionHeader
              icon={<Shield className="h-5 w-5 text-primary" />}
              title={messages.settings.privacy.title}
            />
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{messages.settings.privacy.description}</p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="link"
                  {...linkButtonProps(withLocalePrefix("/privacy", locale))}
                  className="whitespace-normal px-3 text-primary"
                >
                  {messages.settings.privacy.privacyPolicy}
                </Button>
                <Button
                  variant="link"
                  {...linkButtonProps(withLocalePrefix("/terms", locale))}
                  className="whitespace-normal px-3 text-primary"
                >
                  {messages.settings.privacy.terms}
                </Button>
                <Button
                  variant="link"
                  {...linkButtonProps(withLocalePrefix("/profile", locale))}
                  className="whitespace-normal px-3 text-primary"
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
              {deleteError ? <ErrorState title={locale === "nl" ? copy.errorTitle : undefined}
                description={deleteError} /> : null}
              <p className="text-sm text-muted-foreground">
                {messages.profile.dangerZone.deleteConfirmDescription}
              </p>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className={
                  "border-[color:var(--destructive)] text-[color:var(--destructive)] " +
                  "hover:bg-[color:color-mix(in_oklch,var(--destructive)_10%,var(--card)_90%)]"
                }
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {messages.profile.dangerZone.deleteAccount}
              </Button>
            </CardContent>
          </Card>
        </div>
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
