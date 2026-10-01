"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SaddleHeightCalculatorForm } from "@/app/(public)/calculators/saddle-height/SaddleHeightCalculatorForm";
import { FrameSizeCalculatorForm } from "@/app/(public)/calculators/frame-size/FrameSizeCalculatorForm";
import { CrankLengthCalculatorForm } from "@/app/(public)/calculators/crank-length/CrankLengthCalculatorForm";
import { AutosaveField, AutosaveStatus } from "@/components/ui";
import { accountCalculatorMessages } from "@/i18n/account/calculators";
import { autosaveMessages } from "@/i18n/account/autosave";
import { crankLengthMessages } from "@/i18n/calculators/crankLength";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { useCalculatorAccountState } from "./useCalculatorAccountState";
type FitCalculatorId = "saddle-height" | "frame-size" | "crank-length";

// Separate typed editors share the same account state hook and the original public form.
export function AccountFitCalculator({ calculator }: { calculator: FitCalculatorId }) {
  const user = useQuery(api.users.queries.getCurrentUser);
  const { locale } = useDashboardMessages();
  if (!user) return <p role="status" className="p-8">{accountCalculatorMessages[locale].loading}</p>;
  if (calculator === "saddle-height") return <SaddleEditor key={user._id} />;
  if (calculator === "frame-size") return <FrameEditor key={user._id} />;
  return <CrankEditor key={user._id} />;
}

function AccountFrame({ state, children }: {
  state: Pick<ReturnType<typeof useCalculatorAccountState>, "ready" | "fromProfile" | "autosave">;
  children: React.ReactNode;
}) {
  const { locale } = useDashboardMessages();
  const copy = accountCalculatorMessages[locale];
  if (!state.ready) return <p role="status" className="p-8">{copy.loading}</p>;
  return (
    <AutosaveField flush={state.autosave.flush} commitOn="release"
      className={"[&_[data-slot=configurator-sticky-result]]:bottom-[calc(68px+max(8px,env(safe-area-inset-bottom)))] "
        + "md:[&_[data-slot=configurator-sticky-result]]:bottom-0"}>
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-8 xl:px-16">
        {state.fromProfile && <p className="text-sm text-muted-foreground">
          {copy.fromProfile}{" · "}
          <Link className="inline-flex min-h-11 items-center underline focus-visible:focus-ring"
            href={withLocalePrefix("/profile", locale)}>{copy.profile}</Link>
        </p>}
        <p className="text-sm text-muted-foreground">{copy.savedSeparately}</p>
        <AutosaveStatus {...state.autosave} messages={autosaveMessages[locale]} onRetry={state.autosave.retry} />
      </div>
      {children}
    </AutosaveField>
  );
}
function SaddleEditor() {
  const state = useCalculatorAccountState("saddle-height");
  const { locale } = useDashboardMessages();
  return <AccountFrame state={state}>{state.ready && <SaddleHeightCalculatorForm
    isNl={locale === "nl"} initialValues={state.values} onValuesChange={state.setValues} />}</AccountFrame>;
}
function FrameEditor() {
  const state = useCalculatorAccountState("frame-size");
  const { locale } = useDashboardMessages();
  return <AccountFrame state={state}>{state.ready && <FrameSizeCalculatorForm
    locale={locale} initialValues={state.values} onValuesChange={state.setValues} />}</AccountFrame>;
}
function CrankEditor() {
  const state = useCalculatorAccountState("crank-length");
  const { locale } = useDashboardMessages();
  const accountCopy = accountCalculatorMessages[locale];
  const copy = { ...crankLengthMessages[locale], intro: accountCopy.crankIntro,
    save: accountCopy.nextFit, saveHint: accountCopy.nextFitHint };
  return <AccountFrame state={state}>{state.ready && <CrankLengthCalculatorForm
    locale={locale} copy={copy} initialCategory="road" continueHref="/fit"
    initialValues={state.values} onValuesChange={state.setValues} />}</AccountFrame>;
}
