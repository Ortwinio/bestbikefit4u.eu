import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Fit Methods Comparison | BikeFit AI Science",
  description:
    "Compare common bike fitting methods including LeMond, KOPS, and dynamic fit systems, and see where each method is useful.",
  keywords: [
    "bike fit methods",
    "LeMond method",
    "KOPS bike fit",
    "bike fitting comparison",
  ],
  openGraph: {
    title: "Bike Fit Methods Comparison",
    description:
      "A practical comparison of major bike fitting methods and where they fit in modern workflows.",
    type: "article",
  },
};

const methods = [
  {
    name: "LeMond / Hamley Saddle Height",
    focus: "Baseline saddle height from inseam",
    strength: "Simple and repeatable starting point",
    limit: "Needs personal adjustment for flexibility and goals",
  },
  {
    name: "KOPS (Knee Over Pedal Spindle)",
    focus: "Saddle fore-aft reference",
    strength: "Easy workshop reference",
    limit: "Not a complete performance model",
  },
  {
    name: "Dynamic / Motion-Capture Fit",
    focus: "Joint angles under pedaling load",
    strength: "Rich movement data",
    limit: "Requires equipment and specialist time",
  },
];

const links = [
  { href: "/science/calculation-engine", label: "Calculation Engine" },
  { href: "/science/stack-and-reach", label: "Stack and Reach Guide" },
  { href: "/calculators/crank-length", label: "Crank Length Calculator" },
];

export default function BikeFitMethodsPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Bike Fit Methods Comparison",
    description:
      "Comparison of LeMond, KOPS, and dynamic fitting approaches.",
    author: {
      "@type": "Organization",
      name: "BikeFit AI",
    },
    mainEntityOfPage: "/science/bike-fit-methods",
  };

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900">Bike Fit Methods</h1>
        <p className="mt-4 text-lg text-gray-600">
          Modern fitting combines foundational formulas with rider-specific
          context. No single method solves everything in isolation.
        </p>

        <div className="mt-10 space-y-4">
          {methods.map((method) => (
            <article
              key={method.name}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">{method.name}</h2>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Focus:</span>{" "}
                {method.focus}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Strength:</span>{" "}
                {method.strength}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                <span className="font-medium text-gray-800">Limit:</span>{" "}
                {method.limit}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Related Resources</h2>
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
