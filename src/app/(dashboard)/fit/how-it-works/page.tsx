import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getFitMethodCopy } from "@/i18n/account/fitMethod";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: getFitMethodCopy(locale).eyebrow };
}

export default async function HowItWorksPage() {
  const locale = await getRequestLocale();
  const copy = getFitMethodCopy(locale);
  const number = new Intl.NumberFormat(locale);

  return (
    <div className="min-w-0 space-y-6">
      <Button variant="link" className="px-0" nativeButton={false} role="link" render={<Link href={withLocalePrefix("/fit", locale)} />}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        {copy.back}
      </Button>

      <header className="space-y-4 rounded-[28px] bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)] sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">{copy.eyebrow}</p>
        <h1 className="text-[var(--bbf-inkt)] max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{copy.title}</h1>
        <p className="max-w-3xl text-lg leading-relaxed">{copy.description}</p>
        <ol className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2 font-bold">
          {copy.stages.map((stage, index) => (
            <li key={stage} className="flex items-center gap-5">
              {index > 0 && <ArrowRight className="size-4" aria-hidden="true" />}
              {stage}
            </li>
          ))}
        </ol>
      </header>

      <section aria-labelledby="fit-method-inputs" className="space-y-4">
        <h2 id="fit-method-inputs" className="font-display text-3xl font-bold">{copy.inputsTitle}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          {copy.inputs.map((item) => (
            <Card key={item.title} variant="bordered" className="min-w-0 p-6 shadow-none">
              <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed text-muted-foreground">{item.description}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card variant="bordered" className="gap-5 p-6 shadow-none sm:p-7">
        <h2 className="font-display text-3xl font-bold">{copy.processTitle}</h2>
        <ol className="space-y-6">
          {copy.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bbf-lime)] font-mono text-[var(--bbf-inkt)]">{number.format(index + 1)}</span>
              <div className="min-w-0">
                <h3 className="font-display text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <section aria-labelledby="fit-method-outputs" className="space-y-4">
        <h2 id="fit-method-outputs" className="font-display text-3xl font-bold">{copy.outputsTitle}</h2>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {copy.outputs.map((item) => (
            <Card key={item.title} variant="bordered" className="min-w-0 p-6 shadow-none">
              <CardHeader><CardTitle>{item.title}</CardTitle></CardHeader>
              <CardContent><p className="leading-relaxed text-muted-foreground">{item.description}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="fit-method-tips" className="rounded-3xl bg-secondary p-6 text-secondary-foreground sm:p-7">
        <h2 id="fit-method-tips" className="font-display text-3xl font-bold">{copy.tipsTitle}</h2>
        <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed">
          {copy.tips.map((tip) => <li key={tip}>{tip}</li>)}
          <li>{copy.adaptationBefore} <span className="font-mono">{number.format(3)}–{number.format(5)}</span> {copy.adaptationAfter}</li>
        </ul>
      </section>
    </div>
  );
}
