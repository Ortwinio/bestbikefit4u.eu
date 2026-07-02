import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { draftMode } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, HelpCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { FitDisclaimer } from "@/components/content/FitDisclaimer";
import { GuideBodyMarkdown } from "@/components/content/GuideBodyMarkdown";
import { GuideFaqAccordion } from "@/components/content/GuideFaqAccordion";
import { GuideMidPageCta } from "@/components/content/GuideMidPageCta";
import { GuideSoftToolCta } from "@/components/content/GuideSoftToolCta";
import {
  PublicBreadcrumbs,
  PublicCtaBand,
  PublicHero,
  PublicPageShell,
  PublicSection,
  PublicSurfaceCard,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { BRAND } from "@/config/brand";
import { getLegacyGuideSeoKeywords } from "../data";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import {
  resolveClosingCtaCopy,
  resolveSoftCtaTool,
} from "@/lib/guides/cta-resolver";
import {
  listPublishedBlogPostsForGuidePath,
  localizeBlogText,
} from "../../blog/data";
import { getGuideLeafEntries } from "@/lib/guides/backlog";
import {
  buildHubIntro,
  getGuideContent,
  getGuideLinkLabel,
  getGuidePageData,
  listPublishedGuideRecords,
  relatedLinkDescription,
} from "@/lib/guides/content";
import {
  extractFaqs,
  extractQuickAnswer,
  stripMarkdownSection,
  stripTrailingStandaloneCta,
} from "@/lib/guides/markdown-utils";
import {
  buildArticleSchema,
  buildBreadcrumbListSchema,
  buildFaqPageSchema,
} from "@/lib/seo/jsonLd";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function cleanGuideMarkdown(markdown: string) {
  return stripTrailingStandaloneCta(
    stripMarkdownSection(stripMarkdownSection(markdown, "Quick answer"), "FAQ")
  );
}

function LegacyGuideSections({
  sections,
}: {
  sections: {
    title: string;
    type?: "cards" | "steps" | "prose" | "table";
    items: string[];
    tableHeaders?: string[];
    tableRows?: string[][];
  }[];
}) {
  return (
    <>
      {sections.map((section) => (
        <PublicSection
          key={section.title}
          className="mt-10"
          header={{ title: section.title }}
        >
          {(!section.type || section.type === "cards") && (
            <div className="grid gap-4">
              {section.items.map((item) => (
                <PublicSurfaceCard
                  key={item}
                  description={item}
                  leading={<ShieldCheck aria-hidden="true" className="h-5 w-5" />}
                  titleAs="p"
                />
              ))}
            </div>
          )}
          {section.type === "steps" && (
            <ol className="m-0 list-none space-y-3 p-0">
              {section.items.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="pt-0.5 text-sm leading-6 text-muted-foreground">{item}</span>
                </li>
              ))}
            </ol>
          )}
          {section.type === "prose" && (
            <div className="rounded-[var(--radius-xl)] border border-border/70 bg-card p-5 space-y-3">
              {section.items.map((item) => (
                <p key={item} className="text-sm leading-7 text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          )}
          {section.type === "table" && (
            <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-border/70 bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {section.tableHeaders?.map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left font-semibold text-foreground"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {section.tableRows?.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-muted/30">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-muted-foreground"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PublicSection>
      ))}
    </>
  );
}

export async function generateStaticParams() {
  const fallbackSlugs = getGuideLeafEntries("en").map((entry) => entry.slug);
  const dbSlugs = (await listPublishedGuideRecords()).map((guide) => guide.slug);
  return [...new Set([...fallbackSlugs, ...dbSlugs])].map((resolvedSlug) => ({
    slug: resolvedSlug,
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: GuidePageProps): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const draftGuideId = getSearchParam(resolvedSearchParams.draftId);
  const { isEnabled } = await draftMode();
  const guide = await getGuidePageData(
    slug,
    locale,
    isEnabled ? draftGuideId : undefined
  );

  if (!guide) {
    return {
      title: locale === "nl" ? "Pagina niet gevonden" : "Page not found",
      robots: { index: false, follow: false },
    };
  }

  const { entry, dbGuide } = guide;
  const alternates = buildLocaleAlternates(entry.path, locale);
  const canonical = dbGuide?.canonicalUrl ?? alternates.canonical;
  const description = dbGuide?.metaDescription?.[locale] ?? entry.pageBrief;
  // Guide keywords currently come from the fallback guide content source.
  // We keep current precedence for title/description/canonical/OG metadata and
  // only layer in fallback keywords here until the CMS has first-class
  // localized keyword support.
  const keywords = getLegacyGuideSeoKeywords(entry.slug, locale);
  const openGraphImage = dbGuide?.heroImagePublicPath
    ? new URL(dbGuide.heroImagePublicPath, BRAND.siteUrl).toString()
    : dbGuide?.ogImageUrl;

  return {
    title: entry.metaTitle,
    description,
    keywords,
    openGraph: {
      title: dbGuide?.ogTitle?.[locale] ?? entry.metaTitle,
      description: dbGuide?.ogDescription?.[locale] ?? description,
      type: "article",
      url: canonical,
      images: openGraphImage
        ? [
            {
              url: openGraphImage,
              alt:
                dbGuide?.ogImageAlt?.[locale] ??
                dbGuide?.featuredImageAlt?.[locale] ??
                entry.h1,
            },
          ]
        : undefined,
    },
    alternates: {
      ...alternates,
      canonical,
    },
    robots: dbGuide?.robotsIndex === false ? { index: false, follow: true } : undefined,
  };
}

export default async function GuidePage({
  params,
  searchParams,
}: GuidePageProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const draftGuideId = getSearchParam(resolvedSearchParams.draftId);
  const { isEnabled } = await draftMode();
  const guide = await getGuidePageData(
    slug,
    locale,
    isEnabled ? draftGuideId : undefined
  );

  if (!guide) {
    notFound();
  }

  const {
    entry,
    dbGuide,
    childPages,
    isHub,
    faqs: fallbackFaqs,
    leafSections,
    quickAnswer: fallbackQuickAnswer,
  } = guide;
  const guideContent = getGuideContent(slug)?.[locale];
  const pagePath = withLocalePrefix(entry.path, locale);
  const pageUrl = new URL(pagePath, BRAND.siteUrl).toString();
  const guidesIndexUrl = new URL(withLocalePrefix("/guides", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();
  const relatedLinks = entry.internalLinkTargets.map((href) => ({
    href,
    label: getGuideLinkLabel(href, locale),
    description: relatedLinkDescription(locale, href),
  }));
  const relatedBlogLinks = (await listPublishedBlogPostsForGuidePath(entry.path))
    .slice(0, 4)
    .map((post) => ({
      href: `/blog/${post.slug}`,
      label: localizeBlogText(post.title, locale, post.slug),
      description: localizeBlogText(post.excerpt, locale),
    }));
  const heroDescription = !isHub ? guideContent?.heroIntro ?? entry.pageBrief : entry.pageBrief;
  const libraryBody = dbGuide?.libraryBody?.[locale] ?? null;
  const cleanedMarkdown = libraryBody ? cleanGuideMarkdown(libraryBody) : null;
  const quickAnswer = libraryBody
    ? extractQuickAnswer(libraryBody) ?? fallbackQuickAnswer
    : fallbackQuickAnswer;
  const faqs = libraryBody ? extractFaqs(libraryBody) : fallbackFaqs;
  const softTool = resolveSoftCtaTool(entry.cluster, slug, locale);
  const funnel = String(dbGuide?.seoHints?.funnel ?? (isHub ? "TOFU" : "MOFU"));
  const closingCta = resolveClosingCtaCopy(funnel, entry.cluster, locale, slug);
  const closingDescription = guideContent?.ctaDescription ?? closingCta.description;
  const isAuthenticated = await isAuthenticatedNextjs();
  const closingHref = isAuthenticated
    ? withLocalePrefix("/dashboard", locale)
    : closingCta.ctaHref;
  const closingLabel = isAuthenticated
    ? isNl
      ? "Open je fitdashboard"
      : "Open your fit dashboard"
    : closingCta.ctaLabel;

  return (
    <PublicPageShell>
      <JsonLd
        schema={[
          buildArticleSchema({
            headline: entry.h1,
            description: dbGuide?.metaDescription?.[locale] ?? entry.pageBrief,
            url: pageUrl,
            inLanguage: locale,
            image: dbGuide?.heroImagePublicPath
              ? new URL(dbGuide.heroImagePublicPath, BRAND.siteUrl).toString()
              : dbGuide?.ogImageUrl,
          }),
          ...(faqs.length > 0 ? [buildFaqPageSchema(faqs)] : []),
          buildBreadcrumbListSchema([
            { name: isNl ? "Home" : "Home", item: homeUrl },
            { name: isNl ? "Gidsen" : "Guides", item: guidesIndexUrl },
            { name: entry.h1, item: pageUrl },
          ]),
        ]}
      />

      {isEnabled && draftGuideId ? (
        <div className="mx-auto mt-6 max-w-5xl rounded-[var(--radius-xl)] border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {isNl
                ? "Previewmodus: dit is een conceptversie."
                : "Preview mode: this is a draft version."}
            </span>
            <Link
              href={`/api/preview-exit?slug=${encodeURIComponent(slug)}&locale=${locale}`}
              className="font-semibold underline underline-offset-4"
            >
              {isNl ? "Preview verlaten" : "Exit preview"}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicBreadcrumbs
          items={[
            { label: isNl ? "Home" : "Home", href: withLocalePrefix("/", locale) },
            { label: isNl ? "Gidsen" : "Guides", href: withLocalePrefix("/guides", locale) },
            { label: entry.h1 },
          ]}
        />
        {dbGuide?.heroImagePublicPath ? (
          <div className="mb-8 mt-6 overflow-hidden rounded-[var(--radius-xl)] border border-border/60">
            <Image
              src={dbGuide.heroImagePublicPath}
              alt={dbGuide.featuredImageAlt?.[locale] ?? `${entry.h1} — ${BRAND.name} guide`}
              width={1200}
              height={675}
              className="w-full object-cover"
            />
          </div>
        ) : null}

        <PublicHero
          eyebrow={isHub ? "Hub" : isNl ? "Gids" : "Guide"}
          title={entry.h1}
          description={heroDescription}
          chips={
            isHub
              ? [
                  isNl ? `${childPages.length} child-pagina's` : `${childPages.length} child pages`,
                  isNl ? "EN + NL parity" : "EN + NL parity",
                  isNl ? "Navigatie + context" : "Navigation + context",
                ]
              : [
                  isNl ? `${leafSections.length} secties` : `${leafSections.length} sections`,
                  isNl
                    ? `${entry.internalLinkTargets.length} gerelateerde links`
                    : `${entry.internalLinkTargets.length} related links`,
                  isNl ? "Praktische gids" : "Practical guide",
                ]
          }
          actions={
            <Button
              variant="outline"
              render={<Link href={withLocalePrefix("/guides", locale)} />}
            >
              {isNl ? "Terug naar gidsen" : "Back to guides"}
            </Button>
          }
        />

        {isHub ? (
          <>
            <PublicSection
              className="mt-10"
              header={{
                eyebrow: isNl ? "Start hier" : "Start here",
                title: isNl
                  ? "Kies de juiste child-gids voor dit cluster"
                  : "Choose the right child guide for this cluster",
                description: buildHubIntro(entry, locale).join(" "),
              }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                {childPages.map((child) => (
                  <PublicSurfaceCard
                    key={child.slug}
                    title={child.pageTitle}
                    description={child.pageBrief}
                    leading={<BookOpen aria-hidden="true" className="h-5 w-5" />}
                    footer={
                      <Link
                        href={withLocalePrefix(child.path, locale)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        {isNl ? "Open gids" : "Open guide"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    }
                  />
                ))}
              </div>
            </PublicSection>

            <div className="mt-10">
              <GuideMidPageCta
                funnel={funnel}
                cluster={entry.cluster}
                locale={locale}
                pagePath={pagePath}
                slug={slug}
              />
            </div>

            <RelatedLinksSection
              title={isNl ? "Verder verkennen" : "Explore next"}
              links={relatedLinks}
              locale={locale}
            />

            <RelatedLinksSection
              title={isNl ? "Gerelateerde blogartikelen" : "Related blog articles"}
              links={relatedBlogLinks}
              locale={locale}
            />
          </>
        ) : (
          <>
            {entry.cluster.toLowerCase().includes("pain") ? <FitDisclaimer locale={locale} /> : null}

            {quickAnswer ? (
              <PublicSection
                className="mt-10"
                header={{
                  eyebrow: isNl ? "Snel antwoord" : "Quick answer",
                  title: isNl ? "Wat je hier als eerste uit haalt" : "What to take away first",
                  description: isNl
                    ? "Gebruik dit blok als samenvatting voordat je de details en meetstappen doorloopt."
                    : "Use this block as the practical summary before you work through the detail and measurement steps.",
                }}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <PublicSurfaceCard
                    title={isNl ? "Belangrijkste inzicht" : "Key takeaway"}
                    description={quickAnswer.keyTakeaway}
                  />
                  <PublicSurfaceCard
                    title={isNl ? "Veelgemaakte fout" : "Most common mistake"}
                    description={quickAnswer.commonMistake}
                  />
                  <PublicSurfaceCard
                    title={isNl ? "Let extra op als..." : "Pay extra attention if..."}
                    description={quickAnswer.payAttention}
                  />
                </div>
              </PublicSection>
            ) : null}

            {softTool ? (
              <div className="mt-6">
                <GuideSoftToolCta
                  toolLabel={softTool.label}
                  toolHref={softTool.href}
                  locale={locale}
                  pagePath={pagePath}
                />
              </div>
            ) : null}

            {cleanedMarkdown ? (
              <PublicSection className="mt-10">
                <GuideBodyMarkdown content={cleanedMarkdown} />
              </PublicSection>
            ) : (
              <LegacyGuideSections sections={leafSections} />
            )}

            <div className="mt-10">
              <GuideMidPageCta
                funnel={funnel}
                cluster={entry.cluster}
                locale={locale}
                pagePath={pagePath}
                slug={slug}
              />
            </div>

            {faqs.length > 0 ? (
              <PublicSection
                className="mt-10"
                header={{
                  title: "FAQ",
                  icon: <HelpCircle className="h-5 w-5" />,
                }}
              >
                <GuideFaqAccordion faqs={faqs} />
              </PublicSection>
            ) : null}

            <RelatedLinksSection
              title={isNl ? "Gerelateerde gidsen en tools" : "Related guides and tools"}
              links={relatedLinks}
              locale={locale}
            />

            <RelatedLinksSection
              title={isNl ? "Gerelateerde blogartikelen" : "Related blog articles"}
              links={relatedBlogLinks}
              locale={locale}
            />
          </>
        )}

        <PublicCtaBand
          className="mt-10"
          eyebrow={isNl ? "Klaar om je fit te starten?" : "Ready to start your fit?"}
          title={closingCta.title}
          description={closingDescription}
          actions={
            <>
              <Button
                render={
                  <TrackedCtaLink
                    href={closingHref}
                    locale={locale}
                    pagePath={pagePath}
                    section="guide_closing_cta"
                    ctaLabel={closingLabel}
                  />
                }
              >
                {closingLabel}
              </Button>
              <Button
                variant="outline"
                render={
                  <TrackedCtaLink
                    href={withLocalePrefix("/guides", locale)}
                    locale={locale}
                    pagePath={pagePath}
                    section="guide_closing_all_guides"
                    ctaLabel={isNl ? "Bekijk alle gidsen" : "View all guides"}
                  />
                }
              >
                {isNl ? "Bekijk alle gidsen" : "View all guides"}
              </Button>
            </>
          }
        />
      </div>
    </PublicPageShell>
  );
}
