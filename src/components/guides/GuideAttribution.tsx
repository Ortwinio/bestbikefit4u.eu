import { guideAuthorshipMessages } from "@/i18n/marketing/guideAuthorship";
import Link from "next/link";
import { AUTHORSHIP, getGuideUpdatedDate } from "@/config/authorship";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";

export function GuideAttribution({ locale, updatedAt }: { locale: Locale; updatedAt?: string | number }) {
  const copy = guideAuthorshipMessages[locale];
  const date = getGuideUpdatedDate(updatedAt);
  const label = date ? new Intl.DateTimeFormat(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`)) : undefined;
  return (
    <div className="space-y-1 text-sm text-muted-foreground" data-guide-attribution>
      <p>{copy.author}: {" "}
        <Link href={withLocalePrefix(AUTHORSHIP.path, locale)} className="underline underline-offset-4">
          {AUTHORSHIP.name}
        </Link>
      </p>
      <p>{date ? <>{copy.updated}: {" "}
        <time dateTime={date}>{label}</time></> : copy.unknownDate}</p>
      <p><Link href={withLocalePrefix("/methods", locale)} className="underline underline-offset-4">
        {copy.methods}
      </Link></p>
    </div>
  );
}
