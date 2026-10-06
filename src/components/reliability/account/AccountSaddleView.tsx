import Link from "next/link";
import type { AccountSaddleResult } from "../../../../shared/reliability/accountSaddle";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { ReliabilityCalculatorTemplate } from "@/components/reliability/ReliabilityCalculatorTemplate";
import { InseamMeasurements, type InseamMeasurementChip } from "./InseamMeasurements";
import { SaddleSettings, type SaddleSettingsValues } from "./SaddleSettings";
import { SaddleResult } from "./SaddleResult";

export interface AccountSaddleViewProps {
  locale: "nl" | "en";
  heightCm?: number;
  measurements: InseamMeasurementChip[];
  model: AccountSaddleResult | null;
  settings: SaddleSettingsValues;
  basis: string;
  settingsUpdatedAt?: number;
  bikeId?: string;
  bikePicker?: React.ReactNode;
  onSaveEstimate?: (valueCm: number, confirmed: boolean) => Promise<unknown>;
  onSaveMeasurement: (valueCm: number, confirmed: boolean) => Promise<unknown>;
  onSaveSettings: (values: SaddleSettingsValues) => Promise<unknown>;
}

export function AccountSaddleView({ locale, heightCm, measurements, model, settings, basis, settingsUpdatedAt, bikeId, bikePicker, onSaveMeasurement, onSaveEstimate, onSaveSettings }: AccountSaddleViewProps) {
  const copy = accountReliabilityMessages[locale];
  const hasBikeAndGoal = settings.bikeType !== undefined && settings.goal !== undefined;
  return <ReliabilityCalculatorTemplate locale={locale} calculator="saddle-height" title={copy.saddle} description={copy.intro} eyebrow={copy.fromProfile} canRefine={false}
    notice={bikePicker} warnings={<p data-usability="safety" className="rounded-xl border border-border bg-muted p-4">{copy.safety}</p>}
    steps={[]} unframedResults inputContent={<>
      <InseamMeasurements heightCm={heightCm} measurements={measurements} withinTolerance={model?.withinTolerance ?? false} locale={locale} copy={copy} onSave={onSaveMeasurement} onSaveEstimate={onSaveEstimate} />
      <SaddleSettings key={bikeId ?? "profile"} initial={settings} copy={copy} onSave={onSaveSettings} supportsClimbing savedStatus={settingsUpdatedAt !== undefined ? `${copy.updated}: ${new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(settingsUpdatedAt)}` : copy.unknownDate} />
    </>}
    results={model ? <SaddleResult result={model} copy={copy} locale={locale} basis={basis} currentSaddleHeightMm={settings.currentSaddleHeightMm} hasBikeAndGoal={hasBikeAndGoal} bikeId={bikeId} showNextStep={false} /> : <div><p>{copy.empty}</p><Link href={`/${locale}/profile`} className="underline">{copy.profile}</Link></div>}
    nextStep={!model?.canCheckKneeAngle ? copy.repeatNext : !hasBikeAndGoal ? copy.chooseNext : null}
  />;
}
