import type { RiderSex } from "../riderDemographics";

export type EstimateInput = {
  sex?: RiderSex;
  birthDate?: string;
  weightKg?: number;
  ftpWatts?: number;
  flexibilityScore?: "very_limited" | "limited" | "average" | "good" | "excellent";
};

export type EstimateSource = { title: string; url: string; limitation: string };
export type EstimateResult<Value extends number | string> =
  | { status: "estimated"; value: Value; kind: "derived"; quality: 0.3;
      labelKey: "ftpFromSexAgeWeight" | "flexibilityFromAgeSex";
      basedOn: readonly ("sex" | "age" | "weightKg")[]; sources: readonly EstimateSource[] }
  | { status: "unavailable"; reason: "existing_value" | "missing_inputs" | "invalid_inputs" |
      "sex_not_provided" | "unsupported_reference";
      placeholder?: "[PLACEHOLDER — bron?]"; sources: readonly EstimateSource[] };
