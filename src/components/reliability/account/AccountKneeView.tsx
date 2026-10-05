import Link from "next/link";
import type { KneeAngleResult as KneeResult } from "../../../../shared/reliability/kneeAngle";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { ReliabilityCalculatorTemplate } from "@/components/reliability/ReliabilityCalculatorTemplate";
import { KneeMeasurementForm } from "./KneeMeasurementForm";
import { KneePhotoInstructions } from "./KneePhotoInstructions";
import { KneeAngleResult } from "./KneeAngleResult";

export interface AccountKneeViewProps {
  locale: "nl" | "en";
  canUseKneeAngle: boolean;
  hasMeasurements: boolean;
  currentSaddleHeightMm?: number;
  bikeId?: string;
  bikePicker?: React.ReactNode;
  saved?: { result: KneeResult; recordedAt: number; evaluationDueAt?: number; repeatCount?: number; unresolvedWarning?: boolean };
  onSave: (angleDegrees: number, currentSaddleHeightMm: number) => Promise<unknown>;
}

export function AccountKneeView({ locale, canUseKneeAngle, hasMeasurements, currentSaddleHeightMm, bikeId, bikePicker, saved, onSave }: AccountKneeViewProps) {
  const copy = accountReliabilityMessages[locale];
  return <ReliabilityCalculatorTemplate locale={locale} calculator="saddle-height" title={copy.knee} description={copy.comingSoon} eyebrow={copy.kneeLink}
    canRefine={false} notice={bikePicker} warnings={<p className="rounded-xl border border-border bg-muted p-4">{copy.safety}</p>}
    steps={[]} unframedResults inputContent={<><KneePhotoInstructions copy={copy} />{
      !canUseKneeAngle ? <div><p>{copy.locked}</p><Link href={`/${locale}/pricing`} className="underline">{copy.pricing}</Link></div>
        : !hasMeasurements ? <div><p>{copy.needMeasurements}</p><Link href={`/${locale}/profile`} className="underline">{copy.profile}</Link></div>
          : <KneeMeasurementForm key={bikeId ?? "profile"} copy={copy} currentSaddleHeightMm={currentSaddleHeightMm} onSave={onSave} />}</>}
    results={canUseKneeAngle && saved ? <KneeAngleResult {...saved} copy={copy} locale={locale} /> : <p>{canUseKneeAngle ? copy.noAngle : copy.locked}</p>}
    nextStep={!canUseKneeAngle ? copy.pricing : saved ? saved.result.inWindow ? copy.nextPart : copy.recheck : copy.instructions}
  />;
}
