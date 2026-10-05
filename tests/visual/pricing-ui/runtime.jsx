export const getRequestLocale = async () => new URLSearchParams(window.location.search).get("locale") === "en" ? "en" : "nl";
export const buildLocaleAlternates = () => ({});
export const TrackMarketingEventOnView = () => null;
export function TrackedCtaLink({ locale, pagePath, section, ctaLabel, conversionKey, ...props }) {
  return <a {...props} />;
}
export function JsonLd({ schema }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
