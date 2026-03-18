import Link from "next/link";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

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
    <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={withLocalePrefix(link.href, locale)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            <span className="block">{link.label}</span>
            {link.description ? (
              <span className="mt-1 block text-xs font-normal text-gray-600">
                {link.description}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
