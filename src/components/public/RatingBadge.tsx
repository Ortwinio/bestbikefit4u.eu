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
  const goldTextClass = isLight
    ? "text-[color:oklch(0.88_0.12_92)]"
    : "text-[color:oklch(0.72_0.15_85)]";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-3.5 w-3.5 fill-current text-[color:oklch(0.72_0.15_85)]"
          />
        ))}
      </div>
      <span
        className={cn(
          "text-sm font-semibold",
          goldTextClass
        )}
      >
        {rating}
      </span>
      <span
        className={cn(
          "text-sm",
          goldTextClass
        )}
      >
        · {count}
      </span>
    </div>
  );
}
