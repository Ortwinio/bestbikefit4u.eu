"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";

interface FitPassLandingCtaProps {
  locale: string;
  label: string;
  alreadyActiveLabel: string;
  loginHref: string;
  dashboardHref: string;
}

export function FitPassLandingCta({
  locale,
  label,
  alreadyActiveLabel,
  loginHref,
  dashboardHref,
}: FitPassLandingCtaProps) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNl = locale === "nl";

  // Still loading auth state
  if (user === undefined) {
    return (
      <Button disabled className="min-w-[200px]">
        {label}
      </Button>
    );
  }

  // Already on Pro
  if (user?.tier === "pro") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full bg-[color:var(--success)]/15 px-4 py-1.5 text-sm font-medium text-[color:var(--success)]">
          {alreadyActiveLabel}
        </div>
        <Button render={<Link href={dashboardHref} />} variant="outline">
          {isNl ? "Ga naar mijn dashboard" : "Go to my dashboard"}
        </Button>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <Button render={<Link href={loginHref} />}>
        {label}
      </Button>
    );
  }

  // Authenticated, not Pro — trigger checkout
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handleCheckout} isLoading={isLoading} className="min-w-[200px]">
        {label}
      </Button>
      {error && (
        <p className="text-sm text-[color:var(--destructive)]">{error}</p>
      )}
    </div>
  );
}
