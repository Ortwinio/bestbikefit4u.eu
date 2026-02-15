"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { extractLocaleFromPathname, withLocalePrefix } from "@/i18n/navigation";

type AuthStep = "email" | "code" | "success";

type LoginCopy = {
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
    successTitle: "Welcome to BikeFit AI",
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
    spamHint: "Check your spam folder if you don't see the email.",
    signInTitle: "Sign in to BikeFit AI",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    emailTooltip:
      "Enter the email linked to your BikeFIT account. We'll send the login code here.",
    sendCode: "Send Login Code",
    sendCodeError: "Failed to send verification code. Please try again.",
    resendCodeError: "Failed to resend code. Please try again.",
    noPasswordHint: "No password needed. We'll send you a secure code to sign in.",
    legalHint:
      "By signing in, you agree to our Terms of Service and Privacy Policy.",
  },
  nl: {
    successTitle: "Welkom bij BikeFit AI",
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
    spamHint: "Controleer je spammap als je de e-mail niet ziet.",
    signInTitle: "Log in bij BikeFit AI",
    emailLabel: "E-mailadres",
    emailPlaceholder: "jij@example.com",
    emailTooltip:
      "Vul het e-mailadres in dat aan je BikeFIT-account gekoppeld is. We sturen de inlogcode hiernaartoe.",
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
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  const locale = useMemo(
    () => extractLocaleFromPathname(pathname ?? "") ?? DEFAULT_LOCALE,
    [pathname]
  );
  const text = loginCopy[locale];

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push(withLocalePrefix("/dashboard", locale));
    }
  }, [isAuthenticated, isAuthLoading, locale, router]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn("resend", { email });
      setStep("code");
    } catch (err) {
      console.error("Failed to send code:", err);
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
      setStep("success");
      setTimeout(() => {
        window.location.href = withLocalePrefix("/dashboard", locale);
      }, 1500);
    } catch (err) {
      console.error("Failed to verify code:", err);
      setError(text.invalidCode);
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);
    setResendSuccess(false);

    try {
      await signIn("resend", { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to resend code:", err);
      setError(text.resendCodeError);
    } finally {
      setIsLoading(false);
    }
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
      <Card variant="bordered">
        <CardHeader>
          <button
            type="button"
            onClick={() => setStep("email")}
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
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {text.resendPrompt} {text.resendAction}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">{text.spamHint}</p>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
}
