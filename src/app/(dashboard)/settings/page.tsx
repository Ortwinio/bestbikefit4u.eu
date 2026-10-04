"use client";

import { clearHandoff } from "@/lib/handoff/store";
import { clearNewsletterSignupIntent } from "@/lib/newsletter/signupIntent";

import { SettingsNameField, SettingsUnitsField } from "./SettingsAutosaveFields";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
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
import { emailPreferencesCopy } from "@/i18n/account/emailPreferences";
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
  Trash2,
  User,
  Palette,
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

export default function SettingsPage() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { locale, messages: baseMessages, languageSwitchLabels } = useDashboardMessages();
  const messages = useMemo(() => getSettingsLanguage(baseMessages, locale), [baseMessages, locale]);
  const toast = useToast();
  const copy = toolsSettings[locale];
  const user = useQuery(api.users.queries.getCurrentUser);
  const deleteAccount = useMutation(api.users.mutations.deleteAccount);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
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
              <Button variant="link" {...linkButtonProps(withLocalePrefix("/email-preferences", locale))}>
                {emailPreferencesCopy[locale].title}
              </Button>
              <dl className="divide-y divide-[color:var(--border)]">
                <StatRow label={messages.settings.account.type} value={accountType} />
              </dl>
              <Button
                variant="link"
                onClick={async () => {
                  clearHandoff();
                  clearNewsletterSignupIntent();
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
    </div>
  );
}
