import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui";
import { withLocalePrefix } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";

export const profileWizardCopy = {
  nl: {
    step: "Stap", of: "van", guide: "Zo pak je het aan", link: "Bekijk de uitleg",
    title: "Meet voor jouw fiets",
    description: "Hoe nauwkeuriger je meet, hoe scherper je advies. Je kunt je profiel later aanpassen.",
    steps: ["Lichaamsmaten", "Extra maten", "Flexibiliteit", "Rompstabiliteit", "Comfort", "Hoe fiets je?"],
    help: [
      "Meet zonder schoenen. Lengte en binnenbeenlengte zijn nodig; gewicht is optioneel.",
      "Vraag iemand om je te helpen meten. Controleer de voorgestelde maten met een meetlint.",
      "Houd beide benen recht en reik langzaam naar je tenen, zonder te forceren.",
      "Houd een plank op je onderarmen. Stop zodra je houding inzakt.",
      "Denk aan je gebruikelijke ritten. Kies bij ongemak ook waar je het voelt.",
      "Je ervaring, rijtijd, afstand en voorkeur helpen om een houding te kiezen die je kunt volhouden.",
    ],
  },
  en: {
    step: "Step", of: "of", guide: "How to do it", link: "View the guide",
    title: "Measure for your bike",
    description: "Careful measurements help refine your advice. You can update your profile later.",
    steps: ["Body measurements", "Additional measurements", "Flexibility", "Core stability", "Comfort", "How do you ride?"],
    help: [
      "Measure without shoes. Height and inseam are required; weight is optional.",
      "Ask someone to help you measure. Check the suggested measurements with a tape measure.",
      "Keep both legs straight and slowly reach towards your toes without forcing.",
      "Hold a plank on your forearms. Stop when your posture breaks down.",
      "Think about your usual rides. If you feel discomfort, also select where you feel it.",
      "Your experience, riding time, distance and preference help choose a position you can sustain.",
    ],
  },
};

export function ProfileWizardGuide({ step, locale }: { step: number; locale: Locale }) {
  const copy = profileWizardCopy[locale];
  const section = step < 3 ? "body-measurements" : step === 3 ? "flexibility" : step === 4 ? "core-stability" : "comfort";
  return (
    <aside className="min-w-0 space-y-6">
      {step < 3 && (
        <div className="rounded-3xl bg-secondary p-5">
          <Image src="/illustrations/02-zadelhoogte-meten.webp" alt="" width={420} height={280} className="h-auto w-full object-contain" />
        </div>
      )}
      <Card variant="bordered">
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">{copy.guide}</p>
          <h3 className="font-display text-2xl font-bold">{copy.steps[step - 1]}</h3>
          <p className="text-muted-foreground">{copy.help[step - 1]}</p>
          {step < 6 && <Link className="inline-flex min-h-11 items-center font-semibold text-primary focus-visible:focus-ring" href={withLocalePrefix(`/profile/improve/${section}`, locale)}>{copy.link} →</Link>}
        </CardContent>
      </Card>
      <div className="space-y-3 rounded-3xl bg-[var(--bbf-lime)] p-6 text-[var(--bbf-inkt)]">
        <h3 className="font-display text-2xl font-bold text-[var(--bbf-inkt)]">{copy.title}</h3>
        <p>{copy.description}</p>
      </div>
    </aside>
  );
}
