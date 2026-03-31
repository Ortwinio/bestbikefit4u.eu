import type { ReactNode } from "react";
import { Activity, Bike, ClipboardList, HeartPulse, Sparkles, Target } from "lucide-react";

function IllustrationShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(160deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--secondary)_55%,var(--card)_45%))] p-6 shadow-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,color-mix(in_oklch,var(--warning)_24%,transparent),transparent_52%)]" />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
        <p className="mt-2 text-lg font-semibold text-foreground">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function BikeFitProcessIllustration({ locale }: { locale: "en" | "nl" }) {
  return (
    <IllustrationShell
      eyebrow={locale === "nl" ? "Procesoverzicht" : "Process overview"}
      title={locale === "nl" ? "Van meting naar duidelijke vervolgstap" : "From measurements to a clearer next step"}
    >
      <div className="mt-5 grid gap-3">
        {[
          {
            icon: ClipboardList,
            label: locale === "nl" ? "Metingen en doel" : "Measurements and goal",
          },
          {
            icon: Bike,
            label: locale === "nl" ? "Fiets en rijcontext" : "Bike and riding context",
          },
          {
            icon: Target,
            label: locale === "nl" ? "Praktische aanbevelingen" : "Practical recommendations",
          },
        ].map(({ icon: Icon, label }, index) => (
          <div
            key={label}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl border border-border/70 bg-background/90 p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </IllustrationShell>
  );
}

export function PainFitIllustration({ locale }: { locale: "en" | "nl" }) {
  return (
    <IllustrationShell
      eyebrow={locale === "nl" ? "Fitgerichte check" : "Fit-first review"}
      title={locale === "nl" ? "Bekijk belasting, houding en ondersteuning samen" : "Review load, posture, and support together"}
    >
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <div className="flex items-center gap-2 text-primary">
            <HeartPulse className="h-4 w-4" />
            <span className="text-sm font-semibold text-foreground">
              {locale === "nl" ? "Wat je voelt" : "What you feel"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {locale === "nl"
              ? "Pijn, druk of vermoeidheid tijdens specifieke delen van de rit."
              : "Pain, pressure, or fatigue during specific parts of the ride."}
          </p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-semibold text-foreground">
              {locale === "nl" ? "Wat je controleert" : "What you review"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {locale === "nl"
              ? "Zadelpositie, cockpitbelasting en hoe de fiets jouw lichaam ondersteunt."
              : "Saddle position, cockpit load, and how the bike supports your body."}
          </p>
        </div>
      </div>
    </IllustrationShell>
  );
}

export function CaseStudyIllustration({ locale }: { locale: "en" | "nl" }) {
  return (
    <IllustrationShell
      eyebrow={locale === "nl" ? "Case-study traject" : "Case-study flow"}
      title={locale === "nl" ? "Van startsituatie naar bruikbare inzichten" : "From starting point to usable rider proof"}
    >
      <div className="mt-5 flex items-center justify-between gap-3">
        {[
          {
            icon: Sparkles,
            label: locale === "nl" ? "Probleem" : "Problem",
          },
          {
            icon: Bike,
            label: locale === "nl" ? "Setup" : "Setup",
          },
          {
            icon: Target,
            label: locale === "nl" ? "Uitkomst" : "Outcome",
          },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-1 flex-col items-center rounded-2xl border border-border/70 bg-background/90 px-3 py-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
          </div>
        ))}
      </div>
    </IllustrationShell>
  );
}
