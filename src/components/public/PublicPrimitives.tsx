import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, InfoBox } from "@/components/ui";
import { cn } from "@/utils/cn";

type PublicPageShellProps = {
  children: ReactNode;
  className?: string;
};

type PublicHeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  chips?: string[];
  actions?: ReactNode;
  illustration?: ReactNode;
  className?: string;
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

type PublicCtaBandProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action: ReactNode;
  aside?: ReactNode;
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
}: PublicHeroProps) {
  return (
    <Card
      variant="bordered"
      className={cn(
        "relative overflow-hidden border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_88%,var(--primary)_12%)]",
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
            <div className="flex min-h-56 w-full items-center justify-center rounded-[var(--radius-2xl)] border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--secondary)_8%)] p-6">
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
      variant="bordered"
      className={cn(
        "h-full border-[color:var(--border)] bg-[color:var(--card)] shadow-sm",
        className
      )}
    >
      <CardHeader className="space-y-4">
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-lg)] bg-[color:var(--primary-soft)] text-[color:var(--primary)]">
            {icon}
          </div>
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
      variant="bordered"
      className={cn(
        "overflow-hidden border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_78%,var(--card)_22%)]",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-[color:var(--card)] text-[color:var(--primary)] shadow-sm">
            {icon ?? <ArrowRight className="h-6 w-6" />}
          </div>
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

export function PublicCtaBand({
  eyebrow,
  title,
  description,
  action,
  aside,
  className,
}: PublicCtaBandProps) {
  return (
    <Card
      className={cn(
        "mt-16 overflow-hidden border-[color:color-mix(in_oklch,var(--primary)_20%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_oklch,var(--primary)_12%,var(--card)_88%),color-mix(in_oklch,var(--secondary)_68%,var(--card)_32%))]",
        className
      )}
      variant="bordered"
    >
      <CardContent className="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1fr)_auto] md:px-8 md:py-10">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--primary)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 text-2xl font-bold text-[color:var(--foreground)] md:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[color:var(--muted-foreground)]">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-start justify-center gap-3 md:items-end">
          {action}
          {aside ? <div className="text-sm text-[color:var(--muted-foreground)]">{aside}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicInfoPanel(props: React.ComponentProps<typeof InfoBox>) {
  return <InfoBox variant="secondary" {...props} />;
}
