interface PressureCalculatorFaqProps {
  locale: "en" | "nl";
}

export function PressureCalculatorFaq({ locale }: PressureCalculatorFaqProps) {
  const content =
    locale === "nl"
      ? {
          title: "Veelgestelde vragen",
          items: [
            {
              q: "Hoe nauwkeurig is deze calculator?",
              a: "De uitkomst is een bruikbaar startpunt op basis van gewicht, bandbreedte, ondergrond en bandtype. Controleer daarna altijd band- en velglimieten.",
            },
            {
              q: "Waarom is voor lager dan achter?",
              a: "Bij de meeste fietsen rust meer systeemgewicht op het achterwiel. Daarom ligt de aanbevolen achterdruk meestal hoger.",
            },
            {
              q: "Kan ik dit advies opslaan?",
              a: "Ja. In je dashboard kun je drukadviezen opslaan per fiets, wielset, bandenset en gebruiksdoel.",
            },
          ],
        }
      : {
          title: "Frequently asked questions",
          items: [
            {
              q: "How accurate is this calculator?",
              a: "It gives a strong starting point based on weight, tyre width, surface, and tyre type. Always verify tyre and rim pressure limits afterward.",
            },
            {
              q: "Why is front pressure lower than rear?",
              a: "Most bikes carry more system weight on the rear wheel, so the recommended rear pressure is usually higher.",
            },
            {
              q: "Can I save this recommendation?",
              a: "Yes. Inside the dashboard you can save pressure recommendations per bike, wheelset, tyre setup, and riding goal.",
            },
          ],
        };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <section className="py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">{content.title}</h2>
        <div className="mt-8 space-y-4">
          {content.items.map((item) => (
            <div key={item.q} className="rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">{item.q}</h3>
              <p className="mt-2 text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
