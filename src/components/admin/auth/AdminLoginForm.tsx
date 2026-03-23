"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";

type AdminAuthStep = "email" | "code";

const RESEND_COOLDOWN_SECONDS = 30;

export function AdminLoginForm() {
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const hasHandledNonAdminRef = useRef(false);
  const [step, setStep] = useState<AdminAuthStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    hasHandledNonAdminRef.current = false;
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || isLoading || currentUser === undefined) {
      return;
    }

    if (currentUser?.adminRole) {
      router.replace("/admin/overview");
      return;
    }

    if (currentUser && !hasHandledNonAdminRef.current) {
      hasHandledNonAdminRef.current = true;
      setError("This account does not have admin access.");
      setStep("email");
      setCode("");
      void signOut();
    }
  }, [currentUser, isAuthenticated, isLoading, router, signOut]);

  const handleSendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await signIn("resend", { email });
      setStep("code");
      setCode("");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (submitError) {
      console.error("Failed to send admin login code:", submitError);
      setError("Failed to send the admin verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await signIn("resend", { email, code });
    } catch (submitError) {
      console.error("Failed to verify admin login code:", submitError);
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await signIn("resend", { email });
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (submitError) {
      console.error("Failed to resend admin login code:", submitError);
      setError("Failed to resend the admin verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "code") {
    return (
      <Card className="border-[color:var(--border)] bg-[color:var(--card)] shadow-xl">
        <CardHeader className="space-y-3">
          <Button
            type="button"
            variant="ghost"
            className="w-fit gap-2 px-0 text-[color:var(--muted-foreground)]"
            onClick={() => {
              setStep("email");
              setError(null);
              setCode("");
            }}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <CardTitle className="text-2xl tracking-tight">Enter the verification code</CardTitle>
          <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
            We sent a login code to <span className="font-medium text-[color:var(--foreground)]">{email}</span>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_8%,var(--secondary))] px-4 py-3 text-sm text-[color:var(--foreground)]">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleVerifyCode}>
            <Input
              label="Verification code"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.currentTarget.value)}
              placeholder="Enter code"
              helperText="Paste the six-character code from the email."
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" className="sm:flex-1" isLoading={isSubmitting}>
                Verify code
              </Button>
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                disabled={resendCooldown > 0 || isSubmitting}
                onClick={handleResendCode}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[color:var(--border)] bg-[color:var(--card)] shadow-xl">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl tracking-tight">Request admin access code</CardTitle>
        <p className="text-sm leading-6 text-[color:var(--muted-foreground)]">
          Enter the email address linked to your admin account. We’ll send a magic code for this admin surface only.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="rounded-2xl border border-[color:color-mix(in_oklch,var(--danger)_30%,var(--border))] bg-[color:color-mix(in_oklch,var(--danger)_8%,var(--secondary))] px-4 py-3 text-sm text-[color:var(--foreground)]">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSendCode}>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            placeholder="admin@example.com"
            helperText="Only accounts with an admin role can continue."
            required
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Send admin code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
