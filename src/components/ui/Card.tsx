import { type HTMLAttributes, forwardRef } from "react";
import {
  Card as PrototyperCard,
  CardContent as PrototyperCardContent,
  CardDescription as PrototyperCardDescription,
  CardFooter as PrototyperCardFooter,
  CardHeader as PrototyperCardHeader,
  CardTitle as PrototyperCardTitle,
} from "@/components/prototyper-ui/ui/card";
import { cn } from "@/utils/cn";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated";
}

const cardVariantClassMap = {
  default: "border-transparent shadow-sm",
  bordered: "border-[color:var(--border)] shadow-sm",
  elevated:
    "border-[color:color-mix(in_oklch,var(--border)_72%,var(--card)_28%)] shadow-xl shadow-black/10 dark:shadow-black/30",
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <PrototyperCard
        ref={ref}
        variant="transparent"
        className={cn(
          "rounded-[var(--radius-lg)] border bg-[color:var(--card)] p-6 text-[color:var(--card-foreground)]",
          cardVariantClassMap[variant],
          className
        )}
        {...props}
      >
        {children}
      </PrototyperCard>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardHeader
    ref={ref}
    className={cn("mb-4 space-y-1", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardTitle
    ref={ref}
    className={cn("text-lg font-semibold tracking-tight text-[color:var(--foreground)]", className)}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardDescription
    ref={ref}
    className={cn("text-sm leading-6 text-[color:var(--muted-foreground)]", className)}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardContent
    ref={ref}
    className={cn("text-[color:var(--foreground)]", className)}
    {...props}
  />
));

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardFooter
    ref={ref}
    className={cn("mt-4 flex items-center gap-2", className)}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";
