import { BRAND } from "@/config/brand";

type FaqItem = { q: string; a: string };
type BreadcrumbItem = { name: string; item: string };
type AggregateRatingInput = {
  ratingValue: string;
  ratingCount: number;
  bestRating?: string;
  worstRating?: string;
};

export const CALCULATOR_AGGREGATE_RATING: Required<AggregateRatingInput> = {
  ratingValue: "4.8",
  ratingCount: 380,
  bestRating: "5",
  worstRating: "1",
};

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BRAND.siteUrl}/#organization`,
    name: BRAND.name,
    url: BRAND.siteUrl,
    email: BRAND.supportEmail,
  };
}

export function buildWebSiteSchema({
  url = BRAND.siteUrl,
  description,
  inLanguage,
}: {
  url?: string;
  description?: string;
  inLanguage?: string;
} = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BRAND.siteUrl}/#website`,
    url,
    name: BRAND.name,
    description,
    inLanguage,
    publisher: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
  };
}

export function buildWebApplicationSchema({
  name,
  description,
  url,
  applicationCategory = "SportsApplication",
  aggregateRating,
}: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  aggregateRating?: AggregateRatingInput;
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory,
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    publisher: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
  };

  if (aggregateRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
      bestRating: aggregateRating.bestRating ?? "5",
      worstRating: aggregateRating.worstRating ?? "1",
    };
  }

  return schema;
}

export function buildFaqPageSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function buildBreadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildArticleSchema({
  headline,
  description,
  url,
  inLanguage,
  image,
}: {
  headline: string;
  description: string;
  url: string;
  inLanguage?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage,
    mainEntityOfPage: url,
    image,
    author: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
    publisher: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
  };
}

export function buildBlogPostingSchema({
  headline,
  description,
  url,
  inLanguage,
  image,
  datePublished,
  dateModified,
  authorName,
}: {
  headline: string;
  description: string;
  url: string;
  inLanguage?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image,
    url,
    datePublished,
    dateModified,
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
        }
      : {
          "@id": `${BRAND.siteUrl}/#organization`,
        },
    publisher: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
    mainEntityOfPage: url,
    inLanguage,
  };
}

export function buildHowToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text,
    })),
  };
}
