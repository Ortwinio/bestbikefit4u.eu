import { forwardRef, type ComponentPropsWithoutRef, type HTMLAttributes } from "react";
import {
  Card as PrototyperCard,
  CardContent as PrototyperCardContent,
  CardDescription as PrototyperCardDescription,
  CardFooter as PrototyperCardFooter,
  CardHeader as PrototyperCardHeader,
  CardTitle as PrototyperCardTitle,
} from "@/components/prototyper-ui/ui/card";
import { cn } from "@/utils/cn";

type PrototyperCardProps = ComponentPropsWithoutRef<typeof PrototyperCard>;
type CardVariant = NonNullable<PrototyperCardProps["variant"]> | "bordered";

export interface CardProps extends Omit<PrototyperCardProps, "variant"> {
  variant?: CardVariant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const cardVariant = variant === "bordered" ? "default" : variant;

    return (
      <PrototyperCard
        ref={ref}
        variant={cardVariant}
        className={cn(
          variant === "bordered" ? "border border-[color:var(--border)]" : null,
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
  <PrototyperCardHeader ref={ref} className={className} {...props} />
));

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardTitle ref={ref} className={className} {...props} />
));

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardDescription ref={ref} className={className} {...props} />
));

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardContent ref={ref} className={className} {...props} />
));

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <PrototyperCardFooter ref={ref} className={className} {...props} />
));

CardFooter.displayName = "CardFooter";

export { cardVariants } from "@/components/prototyper-ui/ui/card";
