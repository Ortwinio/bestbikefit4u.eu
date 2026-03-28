import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

type PublicSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  align?: "start" | "center";
  className?: string;
};

type PublicSectionProps<T extends ElementType = "section"> = {
  as?: T;
  header?: PublicSectionHeaderProps;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function PublicSectionHeader({
  eyebrow,
  title,
  description,
  action,
  icon,
  align = "start",
  className,
}: PublicSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-[color:var(--border)]/80 px-5 py-5 sm:px-6",
        align === "center" ? "items-center text-center" : null,
        className
      )}
    >
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div
          className={cn(
            "min-w-0 space-y-2",
            align === "center" ? "sm:mx-auto sm:max-w-2xl sm:items-center" : null
          )}
        >
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--primary)]">
              {eyebrow}
            </p>
          ) : null}
          <div
            className={cn(
              "flex gap-3",
              align === "center" ? "justify-center" : "items-start"
            )}
          >
            {icon ? (
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_78%,var(--background)_22%)] text-[color:var(--primary)]">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0 space-y-2">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-[2rem]">
                {title}
              </h2>
              {description ? (
                <p className="max-w-3xl text-pretty text-sm leading-6 text-[color:var(--muted-foreground)] sm:text-base">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
        </div>
        {action ? <div className="shrink-0 self-start">{action}</div> : null}
      </div>
    </div>
  );
}

export function PublicSection<T extends ElementType = "section">({
  as,
  header,
  children,
  className,
  contentClassName,
  ...props
}: PublicSectionProps<T>) {
  const Component = (as ?? "section") as ElementType;

  return (
    <Component className={className} {...props}>
      <Card
        variant="bordered"
        className="overflow-hidden border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_90%,var(--background)_10%)] shadow-[0_16px_40px_-28px_color-mix(in_oklch,var(--foreground)_28%,transparent)]"
      >
        <div className="h-1 w-full bg-[linear-gradient(90deg,color-mix(in_oklch,var(--primary)_72%,transparent)_0%,color-mix(in_oklch,var(--secondary)_82%,var(--background)_18%)_100%)]" />
        {header ? <PublicSectionHeader {...header} /> : null}
        <CardContent className={cn("px-5 py-5 sm:px-6 sm:py-6", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </Component>
  );
}
