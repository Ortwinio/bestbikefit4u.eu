import { Card, CardContent } from "@/components/ui";

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

  return (
    <section className="py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-[color:var(--foreground)]">{content.title}</h2>
        <div className="mt-8 space-y-4">
          {content.items.map((item) => (
            <Card key={item.q} variant="bordered" className="shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{item.q}</h3>
                <p className="mt-2 text-[color:var(--muted-foreground)]">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
