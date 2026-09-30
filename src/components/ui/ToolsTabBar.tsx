import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getLocalizedPublicCalculatorPath, type PublicCalculatorId } from "@/lib/public-calculators/routes";
import { cn } from "@/utils/cn";

export type ToolTab = PublicCalculatorId | "more";

export interface ToolsTabBarProps {
  activeTool: ToolTab;
  locale?: Locale;
  className?: string;
}

const tabs: { id: ToolTab; nl: string; en: string }[] = [
  { id: "bike-fit", nl: "Bike fit", en: "Bike fit" },
  { id: "saddle-height", nl: "Zadelhoogte", en: "Saddle height" },
  { id: "frame-size", nl: "Framemaat", en: "Frame size" },
  { id: "tire-pressure", nl: "Bandenspanning", en: "Tire pressure" },
  { id: "crank-length", nl: "Cranklengte", en: "Crank length" },
  { id: "saddle-width", nl: "Zadelbreedte", en: "Saddle width" },
  { id: "gearing", nl: "Verzet", en: "Gearing" },
  { id: "more", nl: "Meer", en: "More" },
];

/** Page navigation, not ARIA tabs: each item loads a separate calculator route. */
export function ToolsTabBar({ activeTool, locale = "nl", className }: ToolsTabBarProps) {
  return (
    <nav
      aria-label={locale === "nl" ? "Fietstools" : "Cycling tools"}
      className={cn("max-w-full min-w-0 overflow-x-auto rounded-full border border-border bg-card p-1", className)}
    >
      <ul className="m-0 flex w-max min-w-full list-none gap-1 p-0">
        {tabs.map(({ id, ...labels }) => (
          <li key={id} className="shrink-0">
            <Link
              href={withLocalePrefix(
                id === "more" ? "/calculators/power-speed" : getLocalizedPublicCalculatorPath(id, locale),
                locale,
              )}
              aria-current={activeTool === id ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-center whitespace-nowrap rounded-full px-4 py-2 " +
                  "text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] " +
                  "focus-visible:outline-ring",
                activeTool === id
                  ? "bg-[color:var(--bbf-inkt)] text-[color:var(--bbf-wit)] dark:bg-primary " +
                      "dark:text-primary-foreground"
                  : "text-card-foreground hover:bg-muted",
              )}
            >
              {labels[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
