"use client";

import * as BaseField from "@base-ui/react/field";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/prototyper-ui/ui/card";
import { Button } from "@/components/prototyper-ui/ui/button";
import { Input } from "@/components/prototyper-ui/ui/input";
import { Label } from "@/components/prototyper-ui/ui/label";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";

type AuthStep = "email" | "code" | "success";
const RESEND_COOLDOWN_SECONDS = 30;

type LoginCopy = {
  uspTitle: string;
  uspSubtitle: string;
  uspItems: string[];
  accountCreationHint: string;
  successTitle: string;
  successSubtitle: string;
  back: string;
  enterVerificationCode: string;
  codeSentTo: string;
  verificationCodeLabel: string;
  verificationCodePlaceholder: string;
  verificationCodeTooltip: string;
  invalidCode: string;
  resendSuccess: string;
  verifyCode: string;
  resendPrompt: string;
  resendAction: string;
  resendIn: string;
  changeEmailAction: string;
  codeSentSuccess: string;
  spamHint: string;
  signInTitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailTooltip: string;
  sendCode: string;
  sendCodeError: string;
  resendCodeError: string;
  googleSignIn: string;
  googleSignInError: string;
  continueWithEmail: string;
  noPasswordHint: string;
  legalHint: string;
  supportHint: string;
  localhostDevLoginLabel: string;
  localhostDevLoginHint: string;
  localhostDevLoginError: string;
};

const loginCopy: Record<Locale, LoginCopy> = {
  en: {
    uspTitle: "What you get after signing up",
    uspSubtitle: "Your free account includes:",
    uspItems: [
      "Personalized saddle height, reach, and handlebar targets",
      "Prioritized adjustment sequence so you know what to change first",
      "Email report with your complete fit analysis",
    ],
    accountCreationHint:
      "New here? We create your account as soon as you confirm the code.",
    successTitle: "Welcome to BestBikeFit4U",
    successSubtitle: "Redirecting to your dashboard...",
    back: "Back",
    enterVerificationCode: "Enter Verification Code",
    codeSentTo: "We sent a code to",
    verificationCodeLabel: "Verification Code",
    verificationCodePlaceholder: "Enter verification code",
    verificationCodeTooltip:
      "Paste the 7-character code from the email. Codes expire after a short time; request a new one if needed.",
    invalidCode: "Invalid or expired code. Please try again.",
    resendSuccess: "New code sent! Check your email.",
    verifyCode: "Verify Code",
    resendPrompt: "Didn't receive the code?",
    resendAction: "Resend",
    resendIn: "Resend available in",
    changeEmailAction: "Use a different email",
    codeSentSuccess: "Verification code sent. Enter it below to continue.",
    spamHint: "Check your spam folder if you don't see the email.",
    signInTitle: "Create your account or sign in",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    emailTooltip:
      "Enter the email linked to your BestBikeFit4U account. We'll send the login code here.",
    sendCode: "Send Login Code",
    sendCodeError: "Failed to send verification code. Please try again.",
    resendCodeError: "Failed to resend code. Please try again.",
    googleSignIn: "Continue with Google",
    googleSignInError: "Google sign-in could not be started. Please try again.",
    continueWithEmail: "Or continue with email",
    noPasswordHint:
      "No password needed. We send you a secure code that works for both new and existing accounts.",
    legalHint:
      "By signing in, you agree to our Terms of Service and Privacy Policy.",
    supportHint:
      "Need help? Email support if your code does not arrive or you get stuck.",
    localhostDevLoginLabel: "Localhost dev admin sign-in",
    localhostDevLoginHint:
      "Available only on localhost when the local dev login env vars are configured.",
    localhostDevLoginError:
      "Localhost dev login failed. Check your local env vars and try again.",
  },
  nl: {
    uspTitle: "Wat je krijgt na het aanmelden",
    uspSubtitle: "Je gratis account bevat:",
    uspItems: [
      "Persoonlijke afstelwaarden voor zadelhoogte, reach en stuur",
      "Een prioriteitsvolgorde zodat je weet wat je eerst aanpast",
      "Een e-mailrapport met je complete fitanalyse",
    ],
    accountCreationHint:
      "Nieuw hier? We maken je account aan zodra je de code bevestigt.",
    successTitle: "Welkom bij BestBikeFit4U",
    successSubtitle: "Je wordt doorgestuurd naar je dashboard...",
    back: "Terug",
    enterVerificationCode: "Voer verificatiecode in",
    codeSentTo: "We hebben een code gestuurd naar",
    verificationCodeLabel: "Verificatiecode",
    verificationCodePlaceholder: "Voer verificatiecode in",
    verificationCodeTooltip:
      "Plak de 7-tekens code uit de e-mail. Werkt de code niet meer? Vraag dan een nieuwe aan.",
    invalidCode: "Ongeldige of verlopen code. Probeer het opnieuw.",
    resendSuccess: "Nieuwe code verzonden! Controleer je e-mail.",
    verifyCode: "Code verifieren",
    resendPrompt: "Geen code ontvangen?",
    resendAction: "Opnieuw verzenden",
    resendIn: "Opnieuw verzenden mogelijk over",
    changeEmailAction: "Ander e-mailadres gebruiken",
    codeSentSuccess: "Verificatiecode verzonden. Voer de code hieronder in.",
    spamHint: "Controleer je spammap als je de e-mail niet ziet.",
    signInTitle: "Maak je account aan of log in",
    emailLabel: "E-mailadres",
    emailPlaceholder: "jij@example.com",
    emailTooltip:
      "Vul het e-mailadres in dat aan je BestBikeFit4U-account gekoppeld is. We sturen de inlogcode hiernaartoe.",
    sendCode: "Verstuur inlogcode",
    sendCodeError: "Verzenden van verificatiecode mislukt. Probeer opnieuw.",
    resendCodeError: "Opnieuw verzenden mislukt. Probeer opnieuw.",
    googleSignIn: "Doorgaan met Google",
    googleSignInError: "Google-login kon niet worden gestart. Probeer het opnieuw.",
    continueWithEmail: "Of ga verder met e-mail",
    noPasswordHint:
      "Geen wachtwoord nodig. We sturen je een veilige code die werkt voor nieuwe en bestaande accounts.",
    legalHint:
      "Door in te loggen ga je akkoord met onze Voorwaarden en Privacyverklaring.",
    supportHint:
      "Hulp nodig? Mail support als je code niet aankomt of je vastloopt.",
    localhostDevLoginLabel: "Localhost dev admin-login",
    localhostDevLoginHint:
      "Alleen beschikbaar op localhost als de lokale dev-login omgevingsvariabelen zijn ingesteld.",
    localhostDevLoginError:
      "Localhost dev-login mislukt. Controleer je lokale omgevingsvariabelen en probeer opnieuw.",
  },
};

function isLocalhostRuntime() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.6 14.6 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12s4.1 9.3 9.2 9.3c5.3 0 8.8-3.7 8.8-8.9 0-.6-.1-1.1-.2-1.6H12Z"
        fill="#4285F4"
      />
      <path
        d="M2.8 7.5 6 9.9c.9-1.9 3-3.2 6-3.2 1.8 0 3 .8 3.7 1.5l2.5-2.4C16.7 3.6 14.6 2.7 12 2.7 8.5 2.7 5.4 4.7 2.8 7.5Z"
        fill="#34A853"
      />
      <path
        d="M12 21.3c2.5 0 4.6-.8 6.2-2.3l-2.9-2.2c-.8.6-1.9 1.1-3.3 1.1-3.8 0-5.2-2.6-5.4-3.8l-3.1 2.4c2.5 3 5.7 4.8 8.5 4.8Z"
        fill="#FBBC05"
      />
      <path
        d="M6.6 14.1c-.1-.4-.2-.8-.2-1.2s.1-.8.2-1.2L3.5 9.3C3 10.2 2.8 11.1 2.8 12s.2 1.8.7 2.7l3.1-2.4Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AuthField({
  id,
  label,
  tooltip,
  className,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  label: string;
  tooltip?: string;
}) {
  return (
    <BaseField.Field.Root className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {tooltip ? (
          <p className="max-w-xs text-right text-xs leading-5 text-muted-foreground">{tooltip}</p>
        ) : null}
      </div>
      <Input id={id} className={className} {...props} />
    </BaseField.Field.Root>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const logMarketingEvent = useMarketingEventLogger();
  const hasTrackedLoginViewRef = useRef(false);

  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );
  const text = loginCopy[locale];
  const pagePath = withLocalePrefix("/login", locale);
  const sourceTag = searchParams?.get("src") ?? undefined;

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [localhostDevReady, setLocalhostDevReady] = useState(false);
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const localhostDevLoginEnabled =
    process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_DEV_LOGIN === "true";
  const localhostDevLoginSecret =
    process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_SECRET ?? "";
  const localhostDevLoginEmail =
    process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_EMAIL ?? "";
  const localhostDevLoginName =
    process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_NAME ?? "";
  const localhostDevLoginRole =
    process.env.NEXT_PUBLIC_LOCALHOST_DEV_LOGIN_ROLE ?? "super_admin";
  const oauthRedirectingRef = useRef(false);

  // @convex-dev/auth registers a bubble-phase beforeunload listener that calls
  // e.preventDefault() while isRefreshingToken is true (auto-refresh on page load).
  // We suppress it for intentional OAuth redirects using a capture-phase listener,
  // which runs first and stops propagation to all subsequent listeners.
  useEffect(() => {
    const suppress = (e: Event) => {
      if (oauthRedirectingRef.current) {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("beforeunload", suppress, { capture: true });
    return () => window.removeEventListener("beforeunload", suppress, { capture: true });
  }, []);

  const uspPanel = (
    <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        {locale === "nl" ? "Gratis account" : "Free account"}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-foreground">{text.uspTitle}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{text.uspSubtitle}</p>
      <ul className="mt-4 space-y-3 text-sm text-foreground">
        {text.uspItems.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-2xl bg-primary-soft px-4 py-3 text-sm text-foreground">
        {text.accountCreationHint}
      </p>
    </section>
  );

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push(withLocalePrefix("/dashboard", locale));
    }
  }, [isAuthenticated, isAuthLoading, locale, router]);

  useEffect(() => {
    if (hasTrackedLoginViewRef.current) return;
    hasTrackedLoginViewRef.current = true;
    logMarketingEvent({
      eventType: "funnel_login_view",
      locale,
      pagePath,
      section: "login_page",
      sourceTag,
    });
  }, [locale, logMarketingEvent, pagePath, sourceTag]);

  useEffect(() => {
    setLocalhostDevReady(localhostDevLoginEnabled && isLocalhostRuntime());
  }, [localhostDevLoginEnabled]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn("resend", { email });
      void logMarketingEvent({
        eventType: "login_code_requested",
        locale,
        pagePath,
        section: "email_form",
        sourceTag,
      });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
      setResendSuccess(false);
      setCode("");
      setStep("code");
    } catch (err) {
      console.error("Failed to send code:", err);
      void logMarketingEvent({
        eventType: "login_send_error",
        locale,
        pagePath,
        section: "email_form",
        sourceTag,
      });
      setError(text.sendCodeError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("resend", { email, code });
      void result;
      void logMarketingEvent({
        eventType: "login_verified",
        locale,
        pagePath,
        section: "code_form",
        sourceTag,
      });
      setStep("success");
      setTimeout(() => {
        window.location.href = withLocalePrefix("/dashboard", locale);
      }, 1500);
    } catch (err) {
      console.error("Failed to verify code:", err);
      void logMarketingEvent({
        eventType: "login_verify_error",
        locale,
        pagePath,
        section: "code_form",
        sourceTag,
      });
      setError(text.invalidCode);
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) {
      return;
    }
    setIsLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await signIn("resend", { email });
      void logMarketingEvent({
        eventType: "login_code_resent",
        locale,
        pagePath,
        section: "code_form",
        sourceTag,
      });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to resend code:", err);
      void logMarketingEvent({
        eventType: "login_send_error",
        locale,
        pagePath,
        section: "code_form_resend",
        sourceTag,
      });
      setError(text.resendCodeError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setCode("");
    setError(null);
    setResendSuccess(false);
    setSendSuccess(false);
    setResendCooldown(0);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("google", {
        redirectTo: withLocalePrefix("/dashboard", locale),
      });
      void logMarketingEvent({
        eventType: "login_google_started",
        locale,
        pagePath,
        section: "google_button",
        sourceTag,
      });
      if (result.redirect) {
        const redirectUrl = result.redirect.toString();
        oauthRedirectingRef.current = true;
        window.location.href = redirectUrl;
        return;
      }
      setError(text.googleSignInError);
    } catch (err) {
      console.error("Failed to start Google sign-in:", err);
      void logMarketingEvent({
        eventType: "login_google_error",
        locale,
        pagePath,
        section: "google_button",
        sourceTag,
      });
      setError(text.googleSignInError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalhostDevLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const credentials: Record<string, string> = {
        secret: localhostDevLoginSecret,
        hostname: window.location.hostname,
        adminRole: localhostDevLoginRole,
      };
      if (localhostDevLoginEmail) {
        credentials.email = localhostDevLoginEmail;
      }
      if (localhostDevLoginName) {
        credentials.name = localhostDevLoginName;
      }

      await signIn("localhost-dev", credentials);
      window.location.href = withLocalePrefix("/dashboard", locale);
    } catch (err) {
      console.error("Failed to start localhost dev login:", err);
      setError(text.localhostDevLoginError);
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <Card className="gap-0 rounded-[2rem] border border-border/70 bg-card/95 shadow-sm">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            {text.successTitle}
          </h2>
          <p className="text-muted-foreground">{text.successSubtitle}</p>
        </CardContent>
      </Card>
    );
  }

  if (step === "code") {
    return (
      <div className="space-y-5">
        {uspPanel}
        <Card className="gap-0 rounded-[2rem] border border-border/70 bg-card/95 shadow-sm">
          <CardHeader className="space-y-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleChangeEmail}
              className="w-fit px-0 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {text.back}
            </Button>
            <CardTitle>{text.enterVerificationCode}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {text.codeSentTo} <strong>{email}</strong>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleChangeEmail}
                className="px-0 text-sm font-medium text-primary hover:text-primary-dark"
              >
                {text.changeEmailAction}
              </Button>
              {sendSuccess && (
                <p className="rounded-lg bg-success/15 px-3 py-2 text-sm text-success">
                  {text.codeSentSuccess}
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <AuthField
                id="verification-code"
                label={text.verificationCodeLabel}
                tooltip={text.verificationCodeTooltip}
                type="text"
                placeholder={text.verificationCodePlaceholder}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={7}
                className="text-center text-2xl tracking-widest font-mono"
                required
                autoFocus
              />

              {error && (
                <p className="rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              {resendSuccess && (
                <p className="rounded-lg bg-success/15 p-3 text-sm text-success">
                  {text.resendSuccess}
                </p>
              )}

              <Button type="submit" className="w-full" isPending={isLoading}>
                {text.verifyCode}
              </Button>
            </form>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading || resendCooldown > 0}
                className="px-0 text-sm text-primary hover:text-primary-dark"
              >
                {resendCooldown > 0
                  ? `${text.resendIn} ${resendCooldown}s`
                  : `${text.resendPrompt} ${text.resendAction}`}
              </Button>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-center text-xs text-muted-foreground">
              <p>{text.spamHint}</p>
              <p className="mt-2">{text.supportHint}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {uspPanel}
      <Card className="gap-0 rounded-[2rem] border border-border/70 bg-card/95 shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle>{text.signInTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{text.noPasswordHint}</p>
        </CardHeader>
        <CardContent>
          {googleAuthEnabled ? (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => void handleGoogleSignIn()}
                isPending={isLoading}
              >
                <GoogleIcon />
                {text.googleSignIn}
              </Button>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {text.continueWithEmail}
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          ) : null}

          <form onSubmit={handleSendCode} className="space-y-4">
            <AuthField
              id="login-email"
              label={text.emailLabel}
              tooltip={text.emailTooltip}
              type="email"
              placeholder={text.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            {error && (
              <p className="rounded-lg bg-destructive-soft p-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" isPending={isLoading}>
              <Mail className="h-4 w-4 mr-2" />
              {text.sendCode}
            </Button>
          </form>

          {localhostDevReady ? (
            <div className="mt-6 rounded-lg border border-primary/25 bg-primary-soft p-4">
              <p className="text-sm font-medium text-foreground">
                {text.localhostDevLoginHint}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 w-full"
                onClick={() => void handleLocalhostDevLogin()}
                isPending={isLoading}
              >
                {text.localhostDevLoginLabel}
              </Button>
            </div>
          ) : null}

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-center text-xs text-muted-foreground">
              {text.legalHint}
            </p>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {text.supportHint}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
