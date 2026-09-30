import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { Card, CardContent } from "@/components/prototyper-ui/ui/card";
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
        "flex flex-col gap-4 border-b border-border/80 px-5 py-5 sm:px-6",
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
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
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
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-primary">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0 space-y-2">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
                {title}
              </h2>
              {description ? (
                <p className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
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
        variant="secondary"
        className="overflow-hidden gap-0 border border-border/80 bg-card shadow-none"
      >
        <div className="h-1 w-full bg-accent" />
        {header ? <PublicSectionHeader {...header} /> : null}
        <CardContent className={cn("px-5 py-5 sm:px-6 sm:py-6", contentClassName)}>
          {children}
        </CardContent>
      </Card>
    </Component>
  );
}
