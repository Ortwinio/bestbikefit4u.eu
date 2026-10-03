"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Button } from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { newsletterCopy } from "@/i18n/account/newsletter";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { NEWSLETTER_INTENT_TTL, type NewsletterSignupIntent } from "@/lib/newsletter/signupIntent";
import type { NewsletterConsent } from "../../../shared/newsletterConsent";

const currentUser = makeFunctionReference<"query", Record<string, never>, { email?: string } | null>(
  "users/queries:getCurrentUser",
);
const setNewsletter = makeFunctionReference<"mutation", {
  subscribed: boolean; source: "signup"; consent: NewsletterConsent; expectedEmail: string;
}, { newsletter: boolean; granted: boolean }>("emails/preferences:setNewsletter");

export function NewsletterSignupCompletion({ intent, locale, verifiedEmail, onComplete }: {
  intent: NewsletterSignupIntent; locale: Locale; verifiedEmail: string | null; onComplete: () => void;
}) {
  const copy = newsletterCopy[locale];
  const user = useQuery(currentUser, {});
  const save = useMutation(setNewsletter);
  const log = useMarketingEventLogger();
  const busy = useRef(false);
  const attempted = useRef(false);
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const matchingEmail = Boolean(verifiedEmail && user?.email
    && verifiedEmail.trim().toLowerCase() === user.email.trim().toLowerCase());
  const saveConsent = useCallback(async (automatic: boolean) => {
    if (busy.current || !user?.email) return;
    const elapsed = Date.now() - intent.createdAt;
    if (elapsed < 0 || elapsed >= NEWSLETTER_INTENT_TTL) { onComplete(); return; }
    busy.current = true;
    setState("saving");
    const consent = { requestId: intent.requestId, locale: automatic ? intent.locale : locale,
      wordingVersion: intent.wordingVersion };
    try {
      const result = await save({ subscribed: true, source: "signup", consent, expectedEmail: user.email });
      if (result.granted) log({ eventType: "newsletter_opt_in", locale: consent.locale,
        pagePath: withLocalePrefix("/login", locale), section: "newsletter" });
      onComplete();
    } catch { setState("error"); }
    finally { busy.current = false; }
  }, [intent, locale, user, save, log, onComplete]);

  useEffect(() => {
    if (intent.provider !== "email" || !matchingEmail || attempted.current) return;
    attempted.current = true;
    void saveConsent(true);
  }, [intent.provider, matchingEmail, saveConsent]);

  if (user === undefined) return <p role="status">{copy.loading}</p>;
  return <section className="space-y-5" aria-label={copy.confirmTitle}>
    <h1 className="font-display text-3xl font-bold">{copy.confirmTitle}</h1>
    <p>{user?.email ? copy.confirmText : copy.emailUnavailable}</p>
    {user?.email && <p className="break-all font-semibold">{user.email}</p>}
    <p className="text-sm text-muted-foreground">{copy.description}</p>
    {state === "error" && <p role="alert">{copy.error}</p>}
    {state === "saving" && <p role="status">{copy.saving}</p>}
    <div className="flex flex-wrap gap-3">
      {user?.email && <Button isPending={state === "saving"} disabled={state === "saving"}
        onClick={() => void saveConsent(intent.provider === "email" && matchingEmail)}>
        {state === "error" ? copy.retry : copy.confirm}</Button>}
      <Button variant="outline" disabled={state === "saving"} onClick={onComplete}>{copy.skip}</Button>
    </div>
  </section>;
}
