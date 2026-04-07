import type { ComponentPropsWithoutRef, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/prototyper-ui/ui/card";
import { cn } from "@/utils/cn";
import { PublicIconBadge } from "./PublicIconBadge";

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
      variant="secondary"
      className={cn(
        "public-card-surface-subtle h-full gap-0 border",
        className
      )}
      {...props}
    >
      {title || description || leading ? (
        <CardHeader className={cn(compact ? "px-4 py-4" : "px-5 py-5", "gap-3")}>
          <div className="flex items-start gap-3">
            {leading ? (
              <PublicIconBadge className="mt-0.5">
                {leading}
              </PublicIconBadge>
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
        <CardFooter
          className={cn(
            compact ? "px-4 pb-4" : "px-5 pb-5 sm:px-6 sm:pb-6",
            "items-start"
          )}
        >
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
