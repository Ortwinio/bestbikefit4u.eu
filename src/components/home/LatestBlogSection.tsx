import Link from "next/link";
import { BlogArticleCard } from "@/components/content/BlogArticleCard";
import { Button } from "@/components/prototyper-ui/ui/button";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { listPublishedBlogPosts } from "@/app/(public)/blog/data";

export async function LatestBlogSection({ locale }: { locale: Locale }) {
  const latestBlogPosts = (await listPublishedBlogPosts({ numItems: 3 })).posts;
  if (latestBlogPosts.length === 0) return null;

  return (
    <section className="bg-[color:color-mix(in_oklch,var(--secondary)_40%,var(--background)_60%)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
            {locale === "nl" ? "Van de blog" : "From the blog"}
          </p>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2rem]">
            {locale === "nl" ? "Laatste bikefit-artikelen" : "Latest bike fit articles"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
            {locale === "nl"
              ? "Lees recente verdieping voordat je je metingen of setup-keuzes vastlegt."
              : "Read recent context before you lock in measurements or setup decisions."}
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {latestBlogPosts.map((post) => (
            <BlogArticleCard
              key={post.slug}
              post={post}
              locale={locale}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button
            variant="link"
            className="text-sm font-semibold"
            render={<Link href={withLocalePrefix("/blog", locale)} />}
          >
            {locale === "nl" ? "Bekijk alle artikelen" : "View all articles"}
          </Button>
        </div>
      </div>
    </section>
  );
}
