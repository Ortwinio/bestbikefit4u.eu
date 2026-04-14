import Link from "next/link";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { PublicSection, PublicSurfaceCard } from "@/components/public";
import { ArrowRight } from "lucide-react";

export type RelatedLink = {
  href: string;
  label: string;
  description?: string;
};

interface RelatedLinksSectionProps {
  title: string;
  links: RelatedLink[];
  locale: Locale;
}

export function RelatedLinksSection({
  title,
  links,
  locale,
}: RelatedLinksSectionProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <PublicSection
      className="mt-10"
      header={{
        eyebrow: locale === "nl" ? "Verder lezen" : "Explore more",
        title,
        description:
          locale === "nl"
            ? "Ga verder met gerelateerde gidsen en calculators die logisch aansluiten op wat je net hebt gelezen."
            : "Keep going with related guides and calculators that build on what you just learned.",
      }}
      contentClassName="pt-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <PublicSurfaceCard
            key={link.href}
            compact
            className="transition-transform duration-150 hover:-translate-y-0.5"
            title={
              <Link
                href={withLocalePrefix(link.href, locale)}
                className="inline-flex items-center gap-2 text-[color:var(--foreground)] outline-none transition-colors hover:text-[color:var(--primary)] focus-visible:text-[color:var(--primary)]"
              >
                <span>{link.label}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
            description={link.description ?? "Open the next page in this topic cluster."}
          />
        ))}
      </div>
    </PublicSection>
  );
}
