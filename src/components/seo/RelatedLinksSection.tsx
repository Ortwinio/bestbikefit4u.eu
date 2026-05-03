import { BookOpen } from "lucide-react";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { GuideLinkButton, PublicSection } from "@/components/public";

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
          <GuideLinkButton
            key={link.href}
            href={withLocalePrefix(link.href, locale)}
            icon={<BookOpen className="h-5 w-5" />}
            title={link.label}
            subtitle={link.description}
          />
        ))}
      </div>
    </PublicSection>
  );
}
