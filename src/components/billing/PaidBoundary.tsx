import { useId } from "react";
import Link from "next/link";
import { LockKeyhole, ArrowRight, Bike } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getUsabilityPaidCopy, paidPrice, type PaidBoundaryKind } from "@/i18n/account/usabilityPaid";

/** Presentation only: callers must use the real access result, never infer entitlement from a tier label. */
export function PaidBoundary({ locale, boundary, bikeId }: {
  locale: Locale; boundary: PaidBoundaryKind; bikeId?: string;
}) {
  const stepTitleId = useId();
  const copy = getUsabilityPaidCopy(locale);
  const content = copy.boundaries[boundary];
  const annual = ["second-bike", "compare", "history"].includes(boundary);
  const product = annual ? "annual" : "single";
  const query = new URLSearchParams({ product });
  if (bikeId && !annual) query.set("bikeId", bikeId);
  const presentation = boundary === "compare" ? "compare-strip"
    : boundary === "profile-score" ? "score-cap"
    : boundary === "step-plan" ? "ladder" : "locked-preview";
  return <section data-usability="paid-boundary" data-boundary={boundary}
    className="overflow-hidden rounded-3xl border border-border bg-card text-card-foreground">
    <div data-usability="paid-presentation" data-presentation={presentation}
      className="grid gap-6 p-6 sm:p-8">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
          <LockKeyhole aria-hidden="true" className="size-4" />{copy.paid}
        </span>
        <h2 className="font-display text-2xl font-bold">{content.title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{content.body}</p>
        {(boundary === "step-plan" || boundary === "report") && <section
          data-usability={boundary === "report" ? "paid-boundary" : undefined}
          data-boundary={boundary === "report" ? "step-plan" : undefined} aria-labelledby={stepTitleId}>
          <h3 id={stepTitleId} className="font-semibold">{copy.boundaries["step-plan"].title}</h3>
          <p className="my-3 text-sm text-muted-foreground">
            {copy.boundaries["step-plan"].body} {paidPrice(locale, "single")}.
          </p>
          <ol className="space-y-3">
          {copy.steps.map((step, index) => <li key={step} className="flex items-center gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-secondary-foreground">
              {index + 1}
            </span>{step}
          </li>)}
        </ol></section>}
        {(boundary === "second-bike" || boundary === "compare") && <Bike
          className="size-20 text-primary" strokeWidth={1.25} aria-hidden="true" />}
      </div>
      <div className="flex flex-col justify-center gap-4 rounded-2xl bg-secondary p-5 text-secondary-foreground">
        <p className="text-sm font-semibold">{annual ? copy.annual : copy.single}</p>
        <p><strong className="font-mono text-3xl">{paidPrice(locale, product)}</strong>
          {annual && <span className="ml-2 text-sm">{copy.perYear}</span>}</p>
        <Link href={withLocalePrefix(`/checkout?${query}`, locale)}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-bold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          {annual ? copy.action : copy.singleAction}<ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        </Link>
        {!annual && <Link href={withLocalePrefix("/checkout?product=annual", locale)}
          className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
          {copy.annual} · {paidPrice(locale, "annual")} {copy.perYear}
        </Link>}
      </div>
    </div>
  </section>;
}
