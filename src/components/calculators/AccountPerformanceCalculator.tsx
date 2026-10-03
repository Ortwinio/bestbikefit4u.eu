"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PerformanceCalculator } from "@/app/(public)/calculators/power-speed/PerformanceCalculator";
import type { MoreTool } from "@/components/ui/MoreToolsNav";
import { AutosaveField, AutosaveStatus } from "@/components/ui";
import { autosaveMessages } from "@/i18n/account/autosave";
import { accountCalculatorMessages } from "@/i18n/account/calculators";
import { performanceMessages } from "@/i18n/calculators/performance";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { useCalculatorAccountState } from "./useCalculatorAccountState";
import { RiderFtpPrefill } from "./RiderFtpPrefill";
import { CalculatorChainLayout } from "./CalculatorChainPanel";
import { AccountCalculatorBike, useAccountCalculatorBike } from "./AccountCalculatorBike";

export function AccountPerformanceCalculator({ calculator }: { calculator: MoreTool }) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const { locale } = useDashboardMessages();
  if (!user)
    return (
      <p role="status" className="p-8">
        {accountCalculatorMessages[locale].loading}
      </p>
    );
  return <Editor key={`${user._id}:${calculator}`} calculator={calculator} />;
}

function Editor({ calculator }: { calculator: MoreTool }) {
  const selection = useAccountCalculatorBike();
  const state = useCalculatorAccountState(calculator, { bikeId: selection.bikeId });
  const { locale } = useDashboardMessages();
  const copy = accountCalculatorMessages[locale];
  if (!state.ready || !selection.ready)
    return (
      <p role="status" className="p-8">
        {copy.loading}
      </p>
    );
  const navigation = (
    <nav aria-label={copy.performanceNavigation} className="max-w-full overflow-x-auto p-1">
      <div className="flex w-max gap-2">
        {(["power-speed", "climb-planner", "ftp-wkg", "fuel-hydration"] as const).map((tool) => (
          <Link
            key={tool}
            href={withLocalePrefix(`/tools/${tool}`, locale)}
            aria-current={calculator === tool ? "page" : undefined}
            className={
              "flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 py-2 text-sm " +
              "font-semibold focus-visible:focus-ring " +
              (calculator === tool ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground")
            }
          >
            {performanceMessages[locale].titles[tool]}
          </Link>
        ))}
      </div>
    </nav>
  );
  return (
    <AutosaveField
      flush={state.autosave.flush}
      commitOn="release"
      className={
        "[&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))] " +
        "md:[&_[data-slot=configurator-sticky-result]]:bottom-0"
      }
    >
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 xl:px-16">
        {state.profileFtp && <RiderFtpPrefill ftp={state.profileFtp} locale={locale} />}
        <AutosaveStatus
          {...state.autosave}
          messages={autosaveMessages[locale]}
          onRetry={state.autosave.retry}
        />
      </div>
      <AccountCalculatorBike selection={selection} locale={locale} />
      <CalculatorChainLayout
        calculator={calculator}
        locale={locale}
        chain={state.chain}
        context={state.context}
        bikeId={selection.bikeId}
      >
        <PerformanceCalculator
          key={state.formKey}
          tool={calculator}
          locale={locale}
          initialValues={state.values}
          riderProfile={state.context?.profile ?? undefined}
          ftpKnown={Boolean(state.context?.profile?.ftpWatts && state.context.profile.ftpWatts > 0)
            || [...state.chain.pendingChanges, ...state.chain.trialChanges, ...state.chain.savedChanges]
            .some((change) => change.field === "ftpWatts")}
          onValuesChange={state.setValues}
          navigation={navigation}
          account
        />
      </CalculatorChainLayout>
    </AutosaveField>
  );
}
