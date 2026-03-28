import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/utils/cn";

type PublicSurfaceCardProps = Omit<ComponentPropsWithoutRef<typeof Card>, "title"> & {
  title?: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  footer?: ReactNode;
  compact?: boolean;
};

export function PublicSurfaceCard({
  title,
  description,
  leading,
  footer,
  children,
  className,
  compact = false,
  ...props
}: PublicSurfaceCardProps) {
  return (
    <Card
      variant="bordered"
      className={cn(
        "h-full border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_92%,var(--background)_8%)] shadow-[0_12px_30px_-24px_color-mix(in_oklch,var(--foreground)_24%,transparent)]",
        className
      )}
      {...props}
    >
      {title || description || leading ? (
        <CardHeader className={cn(compact ? "px-4 py-4" : "px-5 py-5", "gap-3")}>
          <div className="flex items-start gap-3">
            {leading ? (
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--secondary)_80%,var(--background)_20%)] text-[color:var(--primary)]">
                {leading}
              </div>
            ) : null}
            <div className="space-y-1">
              {title ? (
                <CardTitle className="text-lg font-semibold tracking-tight text-[color:var(--foreground)]">
                  {title}
                </CardTitle>
              ) : null}
              {description ? (
                <CardDescription className="text-sm leading-6 text-[color:var(--muted-foreground)]">
                  {description}
                </CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn(compact ? "px-4 pb-4" : "px-5 pb-5 sm:px-6 sm:pb-6")}>
        {children}
      </CardContent>
      {footer ? (
        <div className={cn(compact ? "px-4 pb-4" : "px-5 pb-5 sm:px-6 sm:pb-6")}>{footer}</div>
      ) : null}
    </Card>
  );
}
