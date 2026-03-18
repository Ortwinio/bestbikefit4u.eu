import { BRAND } from "@/config/brand";

type FaqItem = { q: string; a: string };

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

export function buildArticleSchema({
  headline,
  description,
  url,
  inLanguage,
}: {
  headline: string;
  description: string;
  url: string;
  inLanguage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    inLanguage,
    mainEntityOfPage: url,
    author: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
    publisher: {
      "@id": `${BRAND.siteUrl}/#organization`,
    },
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
