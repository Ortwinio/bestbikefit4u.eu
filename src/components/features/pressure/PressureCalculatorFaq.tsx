import { PublicSection, PublicSurfaceCard } from "@/components/public";

interface PressureCalculatorFaqProps {
  locale: "en" | "nl";
}

export function PressureCalculatorFaq({ locale }: PressureCalculatorFaqProps) {
  const content =
    locale === "nl"
      ? {
          title: "Veelgestelde vragen",
          description: "Korte antwoorden op de belangrijkste vragen over publieke drukadviezen.",
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
          description: "Short answers to the main questions about public pressure guidance.",
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

  return (
    <PublicSection className="mt-10" header={{ title: content.title, description: content.description }}>
      <div className="space-y-4">
        {content.items.map((item) => (
          <PublicSurfaceCard key={item.q} title={item.q} description={item.a}>
            <div />
          </PublicSurfaceCard>
        ))}
      </div>
    </PublicSection>
  );
}
