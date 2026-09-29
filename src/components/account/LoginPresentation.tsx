import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/branding";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";

const copy = {
  nl: {
    title: "Je fit, je fietsen en je voortgang op één plek.",
    description: "Bewaar je maten, vergelijk met je huidige afstelling en zie wat je als volgende aanpast.",
    calculator: "Probeer de calculator zonder account",
  },
  en: {
    title: "Your fit, bikes and progress in one place.",
    description: "Save your measurements, compare your current setup and see what to adjust next.",
    calculator: "Try the calculator without an account",
  },
};

export function LoginPresentation({
  locale,
  benefits,
  children,
}: {
  locale: Locale;
  benefits?: ReactNode;
  children: ReactNode;
}) {
  const text = copy[locale];
  const logo = (
    <BrandLogo
      href={withLocalePrefix("/", locale)}
      className="flex min-h-11 w-60 max-w-full items-center rounded-xl bg-background p-2 focus-visible:focus-ring"
      priority
    />
  );

  return (
    <div className="grid min-h-dvh w-full min-w-0 bg-background text-foreground lg:grid-cols-2">
      <div className="px-4 pt-3 lg:hidden">{logo}</div>
      <div className="flex min-w-0 items-center justify-center px-4 py-6 lg:order-2 lg:p-12">
        <div className="w-full min-w-0 max-w-[440px] space-y-6">
          {children}
          <Link
            href={withLocalePrefix("/calculators/bike-fit", locale)}
            className="flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-center text-sm font-bold text-primary underline underline-offset-4 focus-visible:focus-ring"
          >
            {text.calculator}
          </Link>
        </div>
      </div>
      <section className="mx-4 mb-6 flex min-w-0 flex-col rounded-3xl bg-[color:var(--bbf-lime)] p-5 text-[color:var(--bbf-inkt)] lg:order-1 lg:m-0 lg:rounded-none lg:px-14 lg:py-12">
        <div className="hidden lg:block">{logo}</div>
        <div className="order-2 my-6 flex flex-1 items-center lg:order-none lg:my-10">
          <Image
            src="/illustrations/01-racefiets.webp"
            alt=""
            width={960}
            height={600}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="h-auto w-full mix-blend-multiply"
            priority
          />
        </div>
        <div>
          <h2 className="max-w-lg font-display text-3xl font-extrabold leading-[1.05] tracking-tight lg:text-[40px]">
            {text.title}
          </h2>
          <p className="mt-3 max-w-lg text-[17px] leading-relaxed text-[color:var(--bbf-tekst)]">
            {text.description}
          </p>
          {benefits}
        </div>
      </section>
    </div>
  );
}
