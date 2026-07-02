import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BlogArticleCard } from "@/components/content/BlogArticleCard";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  PublicCtaBand,
  PublicHero,
  PublicPageShell,
  PublicSection,
} from "@/components/public";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND } from "@/config/brand";
import { buildLocaleAlternates } from "@/i18n/metadata";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { buildBreadcrumbListSchema } from "@/lib/seo/jsonLd";
import {
  getBlogCategoryLabel,
  listAllPublishedBlogPosts,
  localizeBlogText,
  truncateBlogExcerpt,
} from "./data";

export const revalidate = 900;

type BlogIndexProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const PAGE_SIZE = 9;

function getSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const alternates = buildLocaleAlternates("/blog", locale);
  const description =
    locale === "nl"
      ? "Lees praktische artikelen over bikefitting, fietspositie, comfort en setup-keuzes."
      : "Read practical articles about bike fitting, riding position, comfort, and setup decisions.";

  return {
    title: "Blog - BestBikeFit4U",
    description,
    openGraph: {
      title: "Blog - BestBikeFit4U",
      description,
      type: "website",
      url: alternates.canonical,
    },
    alternates,
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexProps) {
  const locale = await getRequestLocale();
  const isNl = locale === "nl";
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedCategory = getSearchParam(resolvedSearchParams.category);
  const currentPage = parsePage(getSearchParam(resolvedSearchParams.page));
  const allPosts = await listAllPublishedBlogPosts();
  const categories = [...new Set(allPosts.map((post) => post.category).filter(Boolean))].sort();
  const filteredPosts = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const posts = filteredPosts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const blogUrl = new URL(withLocalePrefix("/blog", locale), BRAND.siteUrl).toString();
  const homeUrl = new URL(withLocalePrefix("/", locale), BRAND.siteUrl).toString();

  return (
    <PublicPageShell>
      <JsonLd
        schema={buildBreadcrumbListSchema([
          { name: "Home", item: homeUrl },
          { name: "Blog", item: blogUrl },
        ])}
      />

      <PublicHero
        eyebrow={isNl ? "Kennisbank" : "Knowledge base"}
        title="Blog"
        description={
          isNl
            ? "Praktische artikelen die bikefit-keuzes vertalen naar comfort, controle en betere vervolgstappen."
            : "Practical articles that turn bike fit questions into clearer comfort, control, and setup decisions."
        }
        chips={[
          isNl ? `${allPosts.length} artikelen` : `${allPosts.length} articles`,
          isNl ? "Bikefitting" : "Bike fitting",
          isNl ? "EN + NL" : "EN + NL",
        ]}
      />

      <PublicSection
        className="mt-10"
        header={{
          eyebrow: isNl ? "Laatste artikelen" : "Latest articles",
          title: isNl ? "Verdiep je fitbeslissing" : "Go deeper on your fit decision",
          description: isNl
            ? "Filter op onderwerp of scan de nieuwste artikelen vanuit de blogbibliotheek."
            : "Filter by topic or scan the latest articles from the blog library.",
        }}
      >
        {categories.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={!selectedCategory ? "default" : "outline"}
              render={<Link href={withLocalePrefix("/blog", locale)} />}
            >
              {isNl ? "Alles" : "All"}
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                size="sm"
                variant={selectedCategory === category ? "default" : "outline"}
                render={
                  <Link
                    href={`${withLocalePrefix("/blog", locale)}?category=${encodeURIComponent(category)}`}
                  />
                }
              >
                {getBlogCategoryLabel(category, locale)}
              </Button>
            ))}
          </div>
        ) : null}

        {posts.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post, index) => (
                <BlogArticleCard
                  key={post.slug}
                  post={{
                    ...post,
                    excerpt: {
                      en: truncateBlogExcerpt(localizeBlogText(post.excerpt, "en")),
                      nl: truncateBlogExcerpt(localizeBlogText(post.excerpt, "nl")),
                    },
                  }}
                  locale={locale}
                  priority={index < 2}
                />
              ))}
            </div>
            {pageCount > 1 ? (
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => {
                  const params = new URLSearchParams();
                  if (selectedCategory) {
                    params.set("category", selectedCategory);
                  }
                  if (page > 1) {
                    params.set("page", String(page));
                  }
                  const query = params.toString();

                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={page === safePage ? "default" : "outline"}
                      render={
                        <Link
                          href={`${withLocalePrefix("/blog", locale)}${query ? `?${query}` : ""}`}
                        />
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[var(--radius-xl)] border border-border/70 bg-card p-6 text-sm leading-6 text-muted-foreground">
            <BookOpen className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
            {isNl
              ? "Er zijn nog geen gepubliceerde blogartikelen voor deze selectie."
              : "There are no published blog articles for this selection yet."}
          </div>
        )}
      </PublicSection>

      <PublicCtaBand
        className="mt-12"
        eyebrow={isNl ? "Volgende stap" : "Next step"}
        title={isNl ? "Pas de inzichten toe op je eigen fit" : "Apply the insights to your own fit"}
        description={
          isNl
            ? "Gebruik de gratis bike fit calculator om je metingen en setup-vragen concreet te maken."
            : "Use the free bike fit calculator to turn your measurements and setup questions into practical targets."
        }
        actions={
          <Button render={<Link href={withLocalePrefix("/calculators/bike-fit", locale)} />}>
            {isNl ? "Open bike fit calculator" : "Open bike fit calculator"}
          </Button>
        }
      />
    </PublicPageShell>
  );
}
