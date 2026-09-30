import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { getMarketingLayoutMessages } from "@/i18n/marketing/layout";

export type PublicBreadcrumbItem = {
  label: string;
  href?: string;
};

export function PublicBreadcrumbs({
  items,
  locale = /^\/nl(?:\/|$)/.test(items[0]?.href ?? "") ? "nl" : "en",
}: {
  items: PublicBreadcrumbItem[];
  locale?: Locale;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={getMarketingLayoutMessages(locale).breadcrumb}
      data-breadcrumb
      className="mb-6 mt-6 text-sm text-[color:var(--muted-foreground)]"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 min-w-11 items-center transition-colors hover:text-[color:var(--foreground)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={isCurrent ? "font-medium text-[color:var(--foreground)]" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isCurrent ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
