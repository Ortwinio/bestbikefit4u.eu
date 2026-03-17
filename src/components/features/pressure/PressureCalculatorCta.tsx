import Link from "next/link";
import { withLocalePrefix } from "@/i18n/navigation";

interface PressureCalculatorCtaProps {
  locale: "en" | "nl";
  labels: {
    heading: string;
    body: string;
    primaryButton: string;
    secondaryButton: string;
    loginPrompt: string;
    loginLink: string;
  };
}

export function PressureCalculatorCta({
  locale,
  labels,
}: PressureCalculatorCtaProps) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gray-900 px-6 py-10 text-white sm:px-10">
          <h2 className="text-3xl font-bold">{labels.heading}</h2>
          <p className="mt-4 max-w-2xl text-gray-300">{labels.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={withLocalePrefix("/login", locale)}
              className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400"
            >
              {labels.primaryButton}
            </Link>
            <Link
              href={withLocalePrefix("/about", locale)}
              className="rounded-lg border border-gray-600 px-5 py-3 text-sm font-semibold text-white hover:border-white"
            >
              {labels.secondaryButton}
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-400">
            {labels.loginPrompt}{" "}
            <Link href={withLocalePrefix("/login", locale)} className="text-white underline">
              {labels.loginLink}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
