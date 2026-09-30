"use client";

import Link from "next/link";
import { ArrowRight, Footprints } from "lucide-react";
import { AdjustOrder } from "@/components/ui";
import { buttonVariants } from "@/components/ui/Button";
import { withLocalePrefix } from "@/i18n/navigation";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { toolsCleatMessages } from "@/i18n/account/toolsCleat";

export default function ShoeCleatFitPage() {
  const { locale } = useDashboardMessages();
  const copy = toolsCleatMessages[locale];
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-8">
      <header className="rounded-[2rem] bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">{copy.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-[var(--bbf-inkt)] sm:text-5xl">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">{copy.intro}</p>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-6">
          <Footprints aria-hidden="true" className="mb-4 size-8 text-primary" />
          <h2 className="font-display text-2xl font-bold">{copy.signals}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{copy.signalsBody}</p>
          <div className="mt-6 rounded-2xl bg-[var(--bbf-petrol-zacht)] p-5 text-[var(--bbf-inkt)]">
            <h3 className="font-display text-xl font-bold text-[var(--bbf-inkt)]">{copy.whole}</h3>
            <p className="mt-2">{copy.wholeBody}</p>
          </div>
        </section>
        <AdjustOrder title={copy.order} steps={copy.steps} />
      </div>
      <section className="rounded-3xl bg-[var(--bbf-petrol-zacht)] p-6 text-[var(--bbf-inkt)]">
        <h2 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">{copy.caution}</h2>
        <p className="mt-3 leading-relaxed">{copy.cautionBody}</p>
      </section>
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl font-bold">{copy.help}</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">{copy.helpBody}</p>
      </section>
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-[var(--bbf-inkt)] p-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--bbf-wit)]">{copy.next}</h2>
          <p className="mt-2 text-[var(--bbf-op-donker)]">{copy.nextBody}</p>
        </div>
        <Link href={withLocalePrefix("/fit", locale)} className={buttonVariants()}>
          {copy.action}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </div>
  );
}
