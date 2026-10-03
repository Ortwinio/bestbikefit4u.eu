"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { BrandLogo } from "@/components/branding";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { loginHandoffCopy } from "@/i18n/account/loginHandoff";
import { getWelcomeCopy } from "@/i18n/account/welcome";
import { readHandoff, subscribeHandoff, type HandoffEntry } from "@/lib/handoff/store";

const handoffSnapshot = () => JSON.stringify(readHandoff().entries);
const serverSnapshot = () => "null";

export function LoginHandoffPanel({ locale, children }: { locale: Locale; children: ReactNode }) {
  const text = loginHandoffCopy[locale];
  const welcomeText = getWelcomeCopy(locale);
  const values: Record<string, string> = { ...text.values, ...welcomeText.values, ...welcomeText.extraValues };
  const signingIn = useSearchParams()?.get("mode") === "signin";
  const snapshot = useSyncExternalStore(subscribeHandoff, handoffSnapshot, serverSnapshot);
  const entries = JSON.parse(snapshot) as HandoffEntry[] | null;

  return (
    <div className="grid min-h-dvh w-full min-w-0 bg-background text-foreground lg:grid-cols-2">
      <section aria-labelledby="login-handoff-title" className="flex min-w-0 flex-col gap-7 bg-[color:var(--bbf-lime)] px-5 py-8 text-[color:var(--bbf-inkt)] lg:px-16 lg:py-14">
        <BrandLogo href={withLocalePrefix("/", locale)} className="flex min-h-11 w-60 max-w-full items-center focus-visible:focus-ring" priority />
        <div>
          <h2 id="login-handoff-title" className="max-w-lg font-display text-[44px] font-extrabold leading-[0.98] tracking-tight lg:text-[64px]">{text.title}</h2>
          <p className="mt-4 max-w-lg text-[19px] leading-relaxed">{text.description}</p>
        </div>
        {entries === null ? <p role="status">{text.loading}</p> : entries.length === 0 ? (
          <p className="max-w-lg rounded-2xl bg-white p-5 text-[color:var(--bbf-inkt)]">{text.empty}</p>
        ) : (
          <dl className="flex max-w-[540px] flex-col gap-2">
            {entries.map((entry) => (
              <div key={entry.field} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-[16px] bg-white px-[18px] py-[14px] text-[color:var(--bbf-inkt)]">
                <dt>{text.fields[entry.field]}</dt>
                <dd className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="min-w-0 font-mono [overflow-wrap:anywhere]">
                    {typeof entry.value === "number" ? entry.value.toLocaleString(locale) : values[entry.value] ?? entry.value}
                    {entry.unit !== "none" && entry.unit !== "score" ? ` ${entry.unit}` : ""}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${entry.method === "measured" ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {text.methods[entry.method]}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-auto max-w-lg pt-2 text-sm leading-relaxed">{text.privacy}</p>
      </section>
      <div className="flex min-w-0 items-center justify-center px-5 py-8 lg:px-16 lg:py-14">
        <div className="w-full min-w-0 max-w-[480px] space-y-6">
          <nav aria-label={text.choose} className="grid grid-cols-2 gap-1.5 rounded-[16px] bg-muted p-1.5">
            {([false, true] as const).map((signIn) => <Link key={String(signIn)}
              href={`${withLocalePrefix("/login", locale)}?handoff=1${signIn ? "&mode=signin" : ""}`}
              aria-current={signingIn === signIn ? "page" : undefined}
              className={`flex min-h-11 items-center justify-center rounded-[12px] px-3 text-center font-bold ${signingIn === signIn ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground"}`}>
              {signIn ? text.signIn : text.createAccount}
            </Link>)}
          </nav>
          {children}
          <Link href={withLocalePrefix("/calculators/bike-fit", locale)} className="flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-center text-sm font-bold text-primary underline underline-offset-4 focus-visible:focus-ring">
            {text.calculator}
          </Link>
        </div>
      </div>
    </div>
  );
}
