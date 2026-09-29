import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { cn } from "@/utils/cn";

export type MoreTool = "power-speed" | "climb-planner" | "ftp-wkg" | "fuel-hydration";

export interface MoreToolsNavProps {
  activeTool: MoreTool;
  locale?: Locale;
  className?: string;
}

const tools: { id: MoreTool; nl: string; en: string }[] = [
  { id: "power-speed", nl: "Vermogen ↔ snelheid", en: "Power ↔ speed" },
  { id: "climb-planner", nl: "Klimplanner", en: "Climb planner" },
  { id: "ftp-wkg", nl: "FTP / W/kg", en: "FTP / W/kg" },
  { id: "fuel-hydration", nl: "Voeding & drinken", en: "Fuel & hydration" },
];

/** Render only on one of the four More routes, above the configurator eyebrow. */
export function MoreToolsNav({ activeTool, locale = "nl", className }: MoreToolsNavProps) {
  return (
    <nav
      aria-label={locale === "nl" ? "Meer fietstools" : "More cycling tools"}
      className={cn("max-w-full min-w-0 overflow-x-auto p-1", className)}
    >
      <ul className="m-0 flex w-max list-none gap-2 p-0">
        {tools.map(({ id, ...labels }) => (
          <li key={id} className="shrink-0">
            <Link
              href={withLocalePrefix(`/calculators/${id}`, locale)}
              aria-current={activeTool === id ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-center whitespace-nowrap rounded-full border px-4 " +
                  "py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 " +
                  "focus-visible:outline-ring",
                activeTool === id
                  ? "border-[color:var(--bbf-inkt)] bg-[color:var(--bbf-inkt)] text-[color:var(--bbf-wit)] " +
                      "dark:bg-primary dark:text-primary-foreground"
                  : "border-border bg-card text-card-foreground hover:bg-muted",
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
