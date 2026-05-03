"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { PublicSection } from "@/components/public/PublicSection";
import { Input } from "@/components/prototyper-ui/ui/input";
import type { Locale } from "@/i18n/config";
import { HOME_BIKE_SEARCH_CONTENT } from "./homeRedesignContent";

type BikeSearchBarProps = {
  locale: Locale;
  fitHref: string;
  manualHref: string;
  copy?: {
    eyebrow: string;
    title: string;
    description: string;
    placeholder: string;
    submitLabel: string;
    manualLabel: string;
    manualHintLabel: string;
  };
};

export function BikeSearchBar({ locale, fitHref, manualHref, copy }: BikeSearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const content = copy ?? HOME_BIKE_SEARCH_CONTENT[locale];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const href = trimmed.length > 0 ? `${fitHref}?bike=${encodeURIComponent(trimmed)}` : fitHref;
    router.push(href);
  }

  return (
    <section className="bg-[color:color-mix(in_oklch,var(--secondary)_34%,var(--background)_66%)] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="public-card-surface rounded-[calc(var(--radius-3xl)+0.15rem)] border px-5 py-6 sm:px-8 sm:py-8">
          <PublicSection
            header={{
              eyebrow: content.eyebrow,
              title: content.title,
              description: content.description,
              align: "center",
            }}
            contentClassName="pt-8"
          >
            <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl flex-col gap-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-foreground)]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={content.placeholder}
                  className="h-12 rounded-[var(--radius-md)] border-[color:var(--border)] pl-11"
                  aria-label={content.placeholder}
                />
              </div>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="min-h-12 rounded-full px-6 text-base"
                >
                  {content.submitLabel}
                </Button>
                <Button
                  variant="link"
                  className="text-sm font-semibold"
                  render={<Link href={manualHref} />}
                >
                  {content.manualLabel}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">{content.manualHintLabel}</p>
            </form>
          </PublicSection>
        </div>
      </div>
    </section>
  );
}
