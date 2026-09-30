import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GuideHero } from "@/components/guides/GuideHero";
import styles from "@/components/guides/Guides.module.css";
import { getGuidesMessages } from "@/i18n/marketing/guides";
import { Button } from "@/components/prototyper-ui/ui/button";
import { TrackedCtaLink } from "@/components/analytics/TrackedCtaLink";
import { RelatedLinksSection } from "@/components/seo/RelatedLinksSection";
import { PublicCtaBand } from "@/components/public";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getGuideBacklog, getGuideChildren } from "@/lib/guides/backlog";
import { buildHubIntro, resolveGuidePrimaryCta } from "@/lib/guides/content";
import { listAllPublishedBlogPosts, localizeBlogText } from "../blog/data";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const entry = getGuideBacklog(locale).find((item) => item.slug === "guides");
  const alternates = buildLocaleAlternates("/guides", locale);

  return {
    title: entry?.metaTitle,
    description: entry?.pageBrief,
    openGraph: {
      title: entry?.metaTitle,
      description: entry?.pageBrief,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function GuidesHubPage() {
  const locale = await getRequestLocale();
  const copy = getGuidesMessages(locale);
  const pagePath = withLocalePrefix("/guides", locale);
  const entry = getGuideBacklog(locale).find((item) => item.slug === "guides");

  if (!entry) {
    return null;
  }

  const primaryCta = resolveGuidePrimaryCta(entry.primaryCtaTarget, locale);
  const relatedBlogPosts = (await listAllPublishedBlogPosts())
    .filter((post) =>
      post.relatedGuidePaths?.some((path) => {
        const normalizedPath = path.replace(/^\/(en|nl)(?=\/|$)/, "") || "/";
        return normalizedPath === "/guides" || normalizedPath.startsWith("/guides/");
      })
    )
    .slice(0, 4)
    .map((post) => ({
      href: `/blog/${post.slug}`,
      label: localizeBlogText(post.title, locale, post.slug),
      description: localizeBlogText(post.excerpt, locale),
    }));

  const clusterHubs = getGuideBacklog(locale).filter(
    (item) =>
      item.path.startsWith("/guides/") &&
      item.slug !== "guides" &&
      getGuideChildren(item.slug, locale).length > 0
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <GuideHero
          eyebrow={copy.library}
          title={entry.h1}
          description={entry.pageBrief}
          image="/illustrations/06-meetset.webp"
          imageAlt={copy.image}
          illustration
        >
          <Button nativeButton={false} role="link" render={<a href="#guide-topics" />}>
            {copy.explore}
          </Button>
        </GuideHero>

        <section className={styles.section}>
          <div className={styles.principles}>
            {copy.principles.map((item) => (
              <div key={item.title}>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <p className={styles.intro}>{buildHubIntro(entry, locale).join(" ")}</p>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>{copy.toolsEyebrow}</p>
          <h2>{copy.toolsTitle}</h2>
          <div className={styles.tools}>
            {copy.tools.map((tool) => (
              <Link className={styles.card} href={withLocalePrefix(tool.href, locale)} key={tool.href}>
                <h3>{tool.title}</h3>
                <p>{tool.body}</p>
                <span>{tool.action}<ArrowRight size={18} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <section id="guide-topics" className={styles.section}>
          <p className={styles.eyebrow}>{copy.topicsEyebrow}</p>
          <h2>{copy.topicsTitle}</h2>
          <div className={styles.topics}>
            {clusterHubs.map((hub) => (
              <Link key={hub.slug} href={withLocalePrefix(hub.path, locale)} className={styles.card}>
                <h3>{hub.pageTitle}</h3>
                <p>{hub.pageBrief}</p>
                <span>{copy.openHub}<ArrowRight size={18} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </section>

        <RelatedLinksSection title={copy.relatedBlog} links={relatedBlogPosts} locale={locale} />

        <PublicCtaBand
          className={styles.cta}
          eyebrow={copy.next}
          title={copy.ctaTitle}
          description={copy.ctaBody}
          actions={
            <Button
              nativeButton={false}
              role="link"
              render={
                <TrackedCtaLink
                  href={withLocalePrefix(primaryCta.href, locale)}
                  locale={locale}
                  pagePath={pagePath}
                  section="guides_home_cta"
                  ctaLabel={primaryCta.label ?? entry.primaryCtaLabel}
                />
              }
            >
              {primaryCta.label ?? entry.primaryCtaLabel}
            </Button>
          }
        />
      </div>
    </div>
  );
}
