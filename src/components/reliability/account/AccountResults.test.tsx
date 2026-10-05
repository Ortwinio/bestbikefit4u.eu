// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { calculateAccountSaddleHeight } from "../../../../shared/reliability/accountSaddle";
import { calculateKneeAngle } from "../../../../shared/reliability/kneeAngle";
import { KneeAngleResult } from "./KneeAngleResult";
import { SaddleResult } from "./SaddleResult";

afterEach(cleanup);
describe.each(["nl", "en"] as const)("account advice %s", (locale) => {
  const copy = accountReliabilityMessages[locale];
  it.each([[89], [89, 89], [89, 89, 90]])("does not advertise knee refinement with insufficient or inconsistent measurements %j", (...measurements) => {
    const result = calculateAccountSaddleHeight({ heightCm: 190, measurementsCm: measurements, bikeType: "road", goal: "performance" });
    render(<SaddleResult result={result} copy={copy} locale={locale} basis={copy.measured} hasBikeAndGoal />);
    expect(screen.queryByRole("link", { name: copy.kneeLink })).toBeNull();
  });
  it("shows the knee link only after three good measurements", () => {
    const result = calculateAccountSaddleHeight({ heightCm: 190, measurementsCm: [89, 89, 89], bikeType: "road", goal: "performance", flexibilityScore: 2 });
    render(<SaddleResult result={result} copy={copy} locale={locale} basis={copy.measured} hasBikeAndGoal />);
    expect(screen.getByRole("link", { name: copy.kneeLink }).getAttribute("href")).toBe(`/${locale}/tools/knee-angle`);
    expect(screen.getByText(`${copy.breakdown} 787 mm`)).toBeTruthy();
  });
  it.each([20, 31, 40])("renders shared-model verdict and capped plan for %d degrees", (angleDegrees) => {
    const result = calculateKneeAngle({ angleDegrees, currentSaddleHeightMm: 787, inseamCm: 89, provenance: { kind: "measured", repeatCount: 3, withinTolerance: true } });
    render(<KneeAngleResult result={result} recordedAt={1791158400000} evaluationDueAt={1791763200000} copy={copy} locale={locale} />);
    expect(screen.getByText(angleDegrees === 31 ? copy.inWindow : angleDegrees < 25 ? copy.tooStraight : copy.tooBent)).toBeTruthy();
    expect(screen.getByText(copy.evaluate)).toBeTruthy();
    expect(Math.abs(result.stepMm)).toBeLessThanOrEqual(5);
    expect(screen.getByText(angleDegrees === 31 ? "± 13 mm" : "± 18 mm")).toBeTruthy();
  });
});
