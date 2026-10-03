"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Button, CheckboxGroup, Selectable } from "@/components/ui";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { getNewsletterCopy } from "@/i18n/account/newsletter";
import type { Locale } from "@/i18n/config";
import { NEWSLETTER_WORDING_VERSION, type NewsletterConsent } from "../../../shared/newsletterConsent";

type Preferences = { service: boolean; marketing: boolean; newsletter: boolean };
const getPreferences = makeFunctionReference<"query", Record<string, never>, Preferences | null>("emails/preferences:get");
const setNewsletter = makeFunctionReference<"mutation", { subscribed: boolean; source: "profile"; consent: NewsletterConsent }, { newsletter: boolean; granted: boolean }>("emails/preferences:setNewsletter");

export function NewsletterPreference({ locale }: { locale: Locale }) {
  const preferences = useQuery(getPreferences, {});
  const save = useMutation(setNewsletter);
  const logEvent = useMarketingEventLogger();
  const copy = getNewsletterCopy(locale);
  const [draft, setDraft] = useState<boolean>();
  const [status, setStatus] = useState<"saved" | "error" | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const consent = useRef<NewsletterConsent | null>(null);
  const subscribed = draft ?? preferences?.newsletter ?? false;

  async function submit(value = draft) {
    if (!preferences || value === undefined || busy.current) return;
    busy.current = true;
    setPending(true);
    setStatus(null);
    try {
      consent.current ??= { requestId: crypto.randomUUID(), locale, wordingVersion: NEWSLETTER_WORDING_VERSION };
      const result = await save({ subscribed: value, source: "profile", consent: consent.current });
      consent.current = null;
      setDraft(undefined);
      setStatus("saved");
      if (result.granted) logEvent({ eventType: "newsletter_opt_in", locale, pagePath: `/${locale}/profile` });
    } catch { setStatus("error"); }
    finally { busy.current = false; setPending(false); }
  }

  return <div className="mt-5 space-y-3 text-[color:var(--bbf-inkt)]">
    <h3 className="font-display text-lg font-bold">{copy.title}</h3>
    {preferences === undefined ? <p role="status">{copy.loading}</p> : preferences === null ? <p>{copy.loginRequired}</p> : <div className="space-y-3">
      <CheckboxGroup aria-label={copy.title} value={subscribed ? ["newsletter"] : []} disabled={pending} onValueChange={selected => {
        if (busy.current) return;
        const value = selected.includes("newsletter");
        setDraft(value); consent.current = null; void submit(value);
      }}>
        <Selectable mode="checkbox" name="newsletter" value="newsletter" label={copy.signupLabel} description={copy.description} disabled={pending} />
      </CheckboxGroup>
      {status === "error" && <Button type="button" className="h-auto min-h-11 w-full whitespace-normal" disabled={pending} onClick={() => void submit()}>{copy.retry}</Button>}
    </div>}
    {pending && <p role="status">{copy.saving}</p>}
    {status && <p role={status === "error" ? "alert" : "status"}>{copy[status]}</p>}
  </div>;
}
