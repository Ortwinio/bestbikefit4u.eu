import { Bike } from "lucide-react";
import type { BikeType } from "./bike-showcase.types";
import { cn } from "@/utils/cn";

const TYPE_COLORS: Record<BikeType, string> = {
  road: "bg-blue-100 text-blue-500 dark:bg-blue-950 dark:text-blue-400",
  gravel: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  mountain: "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
  hybrid: "bg-purple-100 text-purple-500 dark:bg-purple-950 dark:text-purple-400",
  tt_triathlon: "bg-red-100 text-red-500 dark:bg-red-950 dark:text-red-400",
  cyclocross: "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
  touring: "bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400",
  city: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

export function BikeShowcaseFallback({
  bikeType,
  className,
}: {
  bikeType: BikeType;
  className?: string;
}) {
  const colorClass = TYPE_COLORS[bikeType] ?? TYPE_COLORS.road;

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        colorClass,
        className
      )}
      aria-hidden="true"
    >
      <Bike className="h-16 w-16 opacity-60" strokeWidth={1.25} />
    </div>
  );
}
