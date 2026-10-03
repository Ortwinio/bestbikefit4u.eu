"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Button, CheckboxGroup, Selectable } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { emailPreferencesCopy } from "@/i18n/account/emailPreferences";
import { useMarketingEventLogger } from "@/components/analytics/MarketingEventTracker";
import { NEWSLETTER_WORDING_VERSION, type NewsletterConsent } from "../../../shared/newsletterConsent";

type Preferences = { service: boolean; marketing: boolean; newsletter: boolean };
type PreferencesInput = Pick<Preferences, "service" | "marketing"> & { newsletter?: boolean; consent?: NewsletterConsent };
type PreferencesResult = Preferences & { newsletterGranted: boolean };
type TokenView = { purpose: "preferences"; preferences: Preferences } | { purpose: "unsubscribe"; category: keyof Preferences };
const getReference = makeFunctionReference<"query", Record<string, never>, Preferences | null>("emails/preferences:get");
const setReference = makeFunctionReference<"mutation", PreferencesInput, PreferencesResult>("emails/preferences:set");
const viewReference = makeFunctionReference<"action", { token: string }, TokenView>("emails/preferenceActions:view");
const saveReference = makeFunctionReference<"action", PreferencesInput & { token: string }, PreferencesResult>("emails/preferenceActions:save");
const unsubscribeReference = makeFunctionReference<"action", { token: string }, null>("emails/preferenceActions:unsubscribe");

export function EmailPreferencesClient({ locale }: { locale: Locale }) {
  const copy = emailPreferencesCopy[locale];
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [view, setView] = useState<TokenView>();
  const [draft, setDraft] = useState<Preferences>();
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const consent = useRef<NewsletterConsent | null>(null);
  const [newsletterTouched, setNewsletterTouched] = useState(false);
  const logEvent = useMarketingEventLogger();
  const getTokenView = useAction(viewReference);
  const saveToken = useAction(saveReference);
  const unsubscribe = useAction(unsubscribeReference);
  const saveAccount = useMutation(setReference);
  const account = useQuery(getReference, token === null ? {} : "skip");

  useEffect(() => {
    let active = true;
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token");
    Promise.resolve().then(async () => {
      if (!active) return;
      setToken(value);
      if (value === null) return;
      try {
        const result = await getTokenView({ token: value });
        if (active) setView(result);
      } catch {
        if (active) setError(true);
      }
    });
    return () => { active = false; };
  }, [getTokenView]);

  const preferences = draft ?? (view?.purpose === "preferences" ? view.preferences : account);
  const category = view?.purpose === "unsubscribe" ? view.category : null;
  const submit = async () => {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(false);
    setSaved(false);
    try {
      if (token && category) await unsubscribe({ token });
      else if (preferences) {
        const args: PreferencesInput = { service: preferences.service, marketing: preferences.marketing };
        if (newsletterTouched) {
          consent.current ??= { requestId: crypto.randomUUID(), locale, wordingVersion: NEWSLETTER_WORDING_VERSION };
          args.newsletter = preferences.newsletter ?? false;
          args.consent = consent.current;
        }
        const result = token ? await saveToken({ token, ...args }) : await saveAccount(args);
        setDraft({ service: result.service, marketing: result.marketing, newsletter: result.newsletter });
        consent.current = null;
        setNewsletterTouched(false);
        if (result.newsletterGranted) logEvent({ eventType: "newsletter_opt_in", locale, pagePath: `/${locale}/email-preferences` });
      } else return;
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  };

  return (
    <main id="main-content" className="mx-auto min-h-screen max-w-xl px-5 py-16">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 sm:p-10">
        <p className="font-display font-bold text-primary">BestBikeFit4U</p>
        <h1 className="font-display text-3xl font-bold">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.description}</p>
        {error && <p role="alert">{copy.error}</p>}
        {saved && <p role="status">{category ? copy.unsubscribed : copy.saved}</p>}
        {!error && !category && preferences === undefined && <p role="status">{copy.loading}</p>}
        {token === null && account === null && <p>{copy.loginRequired}</p>}
        {category ? (
          <div className="space-y-4">
            <p>{copy.confirm} <strong>{copy[category]}</strong></p>
            <Button onClick={() => void submit()} disabled={busy || saved} isLoading={busy}>{copy.unsubscribe}</Button>
          </div>
        ) : preferences ? (
          <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
            <CheckboxGroup
              aria-label={copy.title}
              disabled={busy}
              value={(["service", "marketing", "newsletter"] as const).filter((key) => preferences[key])}
              onValueChange={(selected) => {
                const newsletter = selected.includes("newsletter");
                if (newsletter !== (preferences.newsletter ?? false)) {
                  setNewsletterTouched(true);
                  consent.current = null;
                }
                setDraft({ service: selected.includes("service"), marketing: selected.includes("marketing"), newsletter });
                setSaved(false);
              }}
            >
              {(["service", "marketing", "newsletter"] as const).map((key) => (
                <Selectable
                  key={key}
                  mode="checkbox"
                  name="emailPreferences"
                  value={key}
                  label={copy[key]}
                  description={copy[`${key}Description`]}
                  disabled={busy}
                />
              ))}
            </CheckboxGroup>
            <Button type="submit" disabled={busy} isLoading={busy}>{copy.save}</Button>
          </form>
        ) : null}
        <p className="text-sm text-muted-foreground">{copy.transactional}</p>
        <div className="flex flex-wrap gap-5">
          <Link className="text-primary underline" href={`/${locale}/settings`}>{copy.settings}</Link>
          {(error || account === null) && <Link className="text-primary underline" href={`/${locale}/login`}>{copy.login}</Link>}
        </div>
      </div>
    </main>
  );
}
