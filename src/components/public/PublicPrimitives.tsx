import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/prototyper-ui/ui/card";
import { cn } from "@/utils/cn";
import { PublicIconBadge } from "./PublicIconBadge";

type PublicPageShellProps = {
  children: ReactNode;
  className?: string;
};

type PublicHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  chips?: readonly string[];
  actions?: ReactNode;
  illustration?: ReactNode;
  className?: string;
  illustrationContainerClassName?: string;
};

type PublicSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

type PublicFeatureCardProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
};

type PublicIllustrationPanelProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  bullets?: string[];
  className?: string;
};

export function PublicPageShell({ children, className }: PublicPageShellProps) {
  return (
    <div className={cn("py-16 md:py-20", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function PublicHero({
  eyebrow = "BestBikeFit4U",
  title,
  description,
  chips,
  actions,
  illustration,
  className,
  illustrationContainerClassName,
}: PublicHeroProps) {
  return (
    <Card
      className={cn(
        "public-hero-surface relative overflow-hidden gap-0 border",
        className
      )}
    >
      <div className="absolute -right-14 top-0 h-40 w-40 rounded-full bg-[color:color-mix(in_oklch,var(--primary)_16%,transparent)] blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[color:color-mix(in_oklch,var(--secondary)_30%,transparent)] blur-3xl" />
      <div className="relative grid gap-8 px-6 py-10 md:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.85fr)] md:px-8 md:py-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[color:var(--foreground)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[color:var(--muted-foreground)]">
            {description}
          </p>
          {chips?.length ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] shadow-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
          {actions ? <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
        {illustration ? (
          <div className="flex h-full items-stretch">
            <div
              className={cn(
                "flex min-h-56 w-full items-center justify-center rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--secondary)_8%)] p-6",
                illustrationContainerClassName
              )}
            >
              {illustration}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function PublicSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: PublicSectionProps) {
  return (
    <section className={cn("mt-14", className)}>
      <div className="mb-6">
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--foreground)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-base leading-7 text-[color:var(--muted-foreground)]">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function PublicFeatureCard({
  icon,
  title,
  description,
  className,
}: PublicFeatureCardProps) {
  return (
    <Card
      className={cn(
        "public-card-surface h-full gap-0 border",
        className
      )}
    >
      <CardHeader className="space-y-4">
        {icon ? (
          <PublicIconBadge>
            {icon}
          </PublicIconBadge>
        ) : null}
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

export function PublicIllustrationPanel({
  icon,
  title,
  description,
  bullets,
  className,
}: PublicIllustrationPanelProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden gap-0 border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_78%,var(--card)_22%)]",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <PublicIconBadge
            size="lg"
            className="border-[color:var(--border)]/70 bg-[color:var(--card)]"
          >
            {icon ?? <ArrowRight className="h-6 w-6" />}
          </PublicIconBadge>
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]">
              {description}
            </p>
            {bullets?.length ? (
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--foreground)]">
                {bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span className="mt-1 text-[color:var(--primary)]">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
