import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

// TODO: replace with dynamic rating from Convex when review data is available

type RatingBadgeProps = {
  rating: string;
  count: string;
  variant?: "default" | "light";
  className?: string;
};

export function RatingBadge({ rating, count, variant = "default", className }: RatingBadgeProps) {
  const isLight = variant === "light";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-current text-[color:var(--warning)]"
          />
        ))}
      </div>
      <span
        className={cn(
          "text-sm font-semibold",
          isLight ? "text-[color:var(--primary-foreground)]" : "text-[color:var(--foreground)]"
        )}
      >
        {rating}
      </span>
      <span
        className={cn(
          "text-sm",
          isLight
            ? "text-[color:color-mix(in_oklch,var(--primary-foreground)_70%,transparent)]"
            : "text-[color:var(--muted-foreground)]"
        )}
      >
        · {count}
      </span>
    </div>
  );
}
