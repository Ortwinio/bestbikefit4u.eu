"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding";
import { ToolsTabBar, type ToolTab } from "@/components/ui/ToolsTabBar";
import type { Locale } from "@/i18n/config";
import { stripLocalePrefix, withLocalePrefix } from "@/i18n/navigation";
import { LanguageSwitch } from "./LanguageSwitch";

const approvedTools: Record<string, ToolTab> = {
  "/calculators/saddle-height": "saddle-height",
  "/calculators/frame-size": "frame-size",
  "/calculators/crank-length": "crank-length",
  "/calculators/saddle-width": "saddle-width",
  "/calculators/bike-fit": "bike-fit",
  "/tire-pressure-calculator": "tire-pressure",
  "/bandenspanning-calculator": "tire-pressure",
};

interface ConfiguratorHeaderSwitchProps {
  locale: Locale;
  loginLabel: string;
  languageLabels: { language: string; english: string; dutch: string };
  children: ReactNode;
}

/** Keep the marketing header everywhere except the approved configurator batches. */
export function ConfiguratorHeaderSwitch({
  locale,
  loginLabel,
  languageLabels,
  children,
}: ConfiguratorHeaderSwitchProps) {
  const path = stripLocalePrefix(usePathname() ?? "/");
  const activeTool = approvedTools[path];
  if (!activeTool) return children;
  return (
    <>
    <div className="xl:hidden">{children}</div>
    <header data-usability="site-header" className="hidden border-b border-border bg-background text-foreground xl:block">
      <div
        className={
          "mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-4 sm:px-8 " +
          "xl:flex-nowrap xl:gap-6 xl:px-16"
        }
      >
        <BrandLogo
          href={withLocalePrefix("/", locale)}
          priority
          className="w-[195px] shrink-0"
          imageClassName="h-[34px] w-auto"
        />
        <ToolsTabBar
          activeTool={activeTool}
          locale={locale}
          className="order-3 min-w-0 basis-full xl:order-2 xl:flex-1 xl:basis-auto"
        />
        <div className="order-2 ml-auto flex shrink-0 items-center justify-end gap-2 xl:order-3">
          <div>
            <LanguageSwitch locale={locale} labels={languageLabels} />
          </div>
          <Link
            href={withLocalePrefix("/login", locale)}
            className={
              "inline-flex min-h-11 items-center rounded-full border-2 border-foreground px-4 " +
              "text-sm font-bold focus-visible:focus-ring"
            }
          >
            {loginLabel}
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
