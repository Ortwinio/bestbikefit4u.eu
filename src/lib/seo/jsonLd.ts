import { AUTHORSHIP, getAuthorUrl } from "@/config/authorship";
import type { Locale } from "@/i18n/config";
import { BRAND } from "@/config/brand";

type FaqItem = { q: string; a: string };
type BreadcrumbItem = { name: string; item: string };

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BRAND.siteUrl}/#organization`,
    name: BRAND.name,
    url: BRAND.siteUrl,
    email: BRAND.supportEmail,
    logo: new URL(BRAND.assets.logoPrimary, BRAND.siteUrl).href,
    sameAs: AUTHORSHIP.sameAs.organization,
  };
}

export function buildPersonSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${BRAND.siteUrl}/#ortwin-verreck`,
    name: AUTHORSHIP.name,
    url: getAuthorUrl(locale),
    sameAs: AUTHORSHIP.sameAs.person,
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
}: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return {
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
  author,
  dateModified,
}: {
  headline: string;
  description: string;
  url: string;
  inLanguage?: string;
  image?: string;
  author?: ReturnType<typeof buildPersonSchema>;
  dateModified?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage,
    mainEntityOfPage: url,
    image,
    ...(dateModified ? { dateModified } : {}),
    author: author ?? {
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
