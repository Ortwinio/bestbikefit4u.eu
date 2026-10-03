"use client";

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
import type { ChainPanelController } from "./useCalculatorChain";
import { CalculatorChainLayout } from "./CalculatorChainPanel";
import { AccountCalculatorBike, useAccountCalculatorBike } from "./AccountCalculatorBike";
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

function AccountFrame({ state, children, calculator, selection }: {
  calculator: FitCalculatorId;
  selection: ReturnType<typeof useAccountCalculatorBike>;
  state: Pick<ReturnType<typeof useCalculatorAccountState>, "ready" | "fromProfile" | "autosave" | "context">
    & { chain: ChainPanelController };
  children: React.ReactNode;
}) {
  const { locale } = useDashboardMessages();
  const copy = accountCalculatorMessages[locale];
  if (!state.ready || !selection.ready) return <p role="status" className="p-8">{copy.loading}</p>;
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
        <AutosaveStatus {...state.autosave} messages={autosaveMessages[locale]} onRetry={state.autosave.retry} />
      </div>
      <AccountCalculatorBike selection={selection} locale={locale} />
      <CalculatorChainLayout
        calculator={calculator}
        locale={locale}
        chain={state.chain}
        context={state.context}
        bikeId={selection.bikeId}
      >
        {children}
      </CalculatorChainLayout>
    </AutosaveField>
  );
}

function SaddleEditor() {
  const selection = useAccountCalculatorBike();
  const state = useCalculatorAccountState("saddle-height", { bikeId: selection.bikeId });
  const { locale } = useDashboardMessages();
  return (
    <AccountFrame state={state} calculator="saddle-height" selection={selection}>
      {state.ready && (
        <SaddleHeightCalculatorForm
          key={state.formKey}
          isNl={locale === "nl"}
          initialValues={state.values}
          onValuesChange={state.setValues}
        />
      )}
    </AccountFrame>
  );
}

function FrameEditor() {
  const selection = useAccountCalculatorBike();
  const state = useCalculatorAccountState("frame-size", { bikeId: selection.bikeId });
  const { locale } = useDashboardMessages();
  const inseamKind = state.chain.usedInputs.find((input) => input.field === "inseamCm")?.kind;
  return (
    <AccountFrame state={state} calculator="frame-size" selection={selection}>
      {state.ready && (
        <FrameSizeCalculatorForm
          key={state.formKey}
          locale={locale}
          initialValues={state.values}
          initialInseamSource={inseamKind === "measured" ? "measured" : "estimated"}
          onValuesChange={state.setValues}
        />
      )}
    </AccountFrame>
  );
}

function CrankEditor() {
  const selection = useAccountCalculatorBike();
  const state = useCalculatorAccountState("crank-length", { bikeId: selection.bikeId });
  const { locale } = useDashboardMessages();
  const accountCopy = accountCalculatorMessages[locale];
  const copy = { ...crankLengthMessages[locale], intro: accountCopy.crankIntro };
  return (
    <AccountFrame state={state} calculator="crank-length" selection={selection}>
      {state.ready && (
        <CrankLengthCalculatorForm
          key={state.formKey}
          locale={locale}
          copy={copy}
          initialCategory="road"
          showContinue={false}
          initialValues={state.values}
          onValuesChange={state.setValues}
        />
      )}
    </AccountFrame>
  );
}
