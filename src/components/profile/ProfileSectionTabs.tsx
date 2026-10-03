import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { profileSectionsCopy } from "@/i18n/account/profileSections";

const sections = [
  { key: "data", href: "/profile" }, { key: "advice", href: "/profile/advice" }, { key: "bikes", href: "/bikes" },
] as const;

export function ProfileSectionTabs({ locale, active }: { locale: Locale; active: "data" | "advice" | "bikes" }) {
  const copy = profileSectionsCopy[locale];
  return <nav aria-label={copy.navigation}
    className="flex max-w-full flex-wrap items-center gap-1 rounded-3xl border border-border bg-card p-1">
    {sections.map(section => <Link key={section.key} href={withLocalePrefix(section.href, locale)}
      aria-current={active === section.key ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-sm font-semibold focus-visible:focus-ring ${
        active === section.key ? "bg-foreground text-background" : "text-foreground hover:bg-muted"}`}>
      {copy[section.key]}
    </Link>)}
  </nav>;
}
