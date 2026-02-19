import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stack and Reach Explained | BestBikeFit4U Science",
  description:
    "Learn how stack and reach work, why they are better than seat-tube sizing, and how to use them for frame comparison.",
  keywords: [
    "stack and reach explained",
    "bike frame sizing",
    "frame stack reach",
    "cycling geometry guide",
  ],
  openGraph: {
    title: "Stack and Reach Explained",
    description:
      "A practical guide to using stack and reach to choose and compare bike frames.",
    type: "article",
  },
};

const links = [
  { href: "/science/calculation-engine", label: "Calculation Engine" },
  { href: "/science/bike-fit-methods", label: "Fit Methods Comparison" },
  { href: "/calculators/frame-size", label: "Frame Size Calculator" },
];

export default function StackAndReachPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stack and Reach Explained",
    description:
      "How stack and reach describe bike geometry and improve frame selection accuracy.",
    author: {
      "@type": "Organization",
      name: "BestBikeFit4U",
    },
    mainEntityOfPage: "/science/stack-and-reach",
  };

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">Stack and Reach</h1>
        <p className="mt-4 text-lg text-gray-600">
          Stack and reach provide a consistent way to compare bike frames across
          brands without relying on inconsistent size labels.
        </p>

        <div className="mt-10 grid gap-6">
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">What Is Stack?</h2>
            <p className="mt-3 text-gray-700">
              Stack is the vertical distance from the bottom bracket to the top
              center of the head tube. Higher stack generally means a more
              upright riding posture.
            </p>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">What Is Reach?</h2>
            <p className="mt-3 text-gray-700">
              Reach is the horizontal distance from the bottom bracket to that
              same head-tube reference point. Longer reach usually creates a
              more stretched cockpit.
            </p>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Why It Matters</h2>
            <p className="mt-3 text-gray-700">
              Seat tube size alone can hide major geometry differences. Stack
              and reach reflect real rider position and are the best baseline
              when matching a frame to fit targets.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Continue Reading</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
