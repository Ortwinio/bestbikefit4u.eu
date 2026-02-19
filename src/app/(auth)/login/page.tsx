"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui";
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
  noPasswordHint: string;
  legalHint: string;
};

const loginCopy: Record<Locale, LoginCopy> = {
  en: {
    uspTitle: "Why a proper bike fit matters",
    uspSubtitle: "BestBikeFit4U helps you ride better from your very first session.",
    uspItems: [
      "Reduce knee, back, neck, and hand discomfort",
      "Improve pedaling efficiency and sustainable power",
      "Get practical setup targets for your exact bike and goals",
    ],
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
    signInTitle: "Sign in to BestBikeFit4U",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    emailTooltip:
      "Enter the email linked to your BestBikeFit4U account. We'll send the login code here.",
    sendCode: "Send Login Code",
    sendCodeError: "Failed to send verification code. Please try again.",
    resendCodeError: "Failed to resend code. Please try again.",
    noPasswordHint: "No password needed. We'll send you a secure code to sign in.",
    legalHint:
      "By signing in, you agree to our Terms of Service and Privacy Policy.",
  },
  nl: {
    uspTitle: "Waarom een goede bikefitting belangrijk is",
    uspSubtitle: "Met BestBikeFit4U rijd je vanaf je eerste sessie beter.",
    uspItems: [
      "Minder knie-, rug-, nek- en handklachten",
      "Efficiënter trappen en vermogen langer vasthouden",
      "Concrete afstelwaarden voor jouw fiets en doelen",
    ],
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
    signInTitle: "Log in bij BestBikeFit4U",
    emailLabel: "E-mailadres",
    emailPlaceholder: "jij@example.com",
    emailTooltip:
      "Vul het e-mailadres in dat aan je BestBikeFit4U-account gekoppeld is. We sturen de inlogcode hiernaartoe.",
    sendCode: "Verstuur inlogcode",
    sendCodeError: "Verzenden van verificatiecode mislukt. Probeer opnieuw.",
    resendCodeError: "Opnieuw verzenden mislukt. Probeer opnieuw.",
    noPasswordHint:
      "Geen wachtwoord nodig. We sturen je een veilige code om in te loggen.",
    legalHint:
      "Door in te loggen ga je akkoord met onze Voorwaarden en Privacyverklaring.",
  },
};

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

  const uspPanel = (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h2 className="text-base font-semibold text-blue-900">{text.uspTitle}</h2>
      <p className="mt-1 text-sm text-blue-700">{text.uspSubtitle}</p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-blue-800">
        {text.uspItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
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

  if (step === "success") {
    return (
      <Card variant="bordered">
        <CardContent className="pt-8 pb-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {text.successTitle}
          </h2>
          <p className="text-gray-600">{text.successSubtitle}</p>
        </CardContent>
      </Card>
    );
  }

  if (step === "code") {
    return (
      <div className="space-y-4">
        {uspPanel}
        <Card variant="bordered">
          <CardHeader>
            <button
              type="button"
              onClick={handleChangeEmail}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {text.back}
            </button>
            <CardTitle>{text.enterVerificationCode}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {text.codeSentTo} <strong>{email}</strong>
            </p>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {text.changeEmailAction}
              </button>
              {sendSuccess && (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  {text.codeSentSuccess}
                </p>
              )}
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <Input
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
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              {resendSuccess && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  {text.resendSuccess}
                </p>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {text.verifyCode}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || resendCooldown > 0}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resendCooldown > 0
                  ? `${text.resendIn} ${resendCooldown}s`
                  : `${text.resendPrompt} ${text.resendAction}`}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">{text.spamHint}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {uspPanel}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>{text.signInTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-4">
            <Input
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
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Mail className="h-4 w-4 mr-2" />
              {text.sendCode}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">{text.noPasswordHint}</p>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">{text.legalHint}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
