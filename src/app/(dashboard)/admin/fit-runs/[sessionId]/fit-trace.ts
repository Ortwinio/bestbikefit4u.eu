import type { Doc } from "../../../../../../convex/_generated/dataModel";

export type FitRunTraceDetail = {
  session: Doc<"fitSessions">;
  user: Doc<"users"> | null;
  bike: Doc<"bikes"> | null;
  profile: Doc<"profiles"> | null;
  engineVersion: Doc<"engine_versions"> | null;
};

export type FitTraceArtifact = {
  key: string;
  title: string;
  description: string;
  value: unknown;
};

const TRACE_FIELDS: Array<{
  key: string;
  title: string;
  description: string;
}> = [
  {
    key: "fitOutputs",
    title: "Fit outputs",
    description: "Structured output payload already attached to the session.",
  },
  {
    key: "outputValues",
    title: "Output values",
    description: "Raw output values returned by the fit engine.",
  },
  {
    key: "recommendations",
    title: "Recommendations",
    description: "Recommendation objects or adjustment payloads.",
  },
  {
    key: "recommendationItems",
    title: "Recommendation items",
    description: "Individual adjustment items associated with this session.",
  },
  {
    key: "trace",
    title: "Calculation trace",
    description: "Step-by-step trace data if the session stores it.",
  },
  {
    key: "traceSteps",
    title: "Trace steps",
    description: "Expanded step records for the calculation.",
  },
  {
    key: "warnings",
    title: "Warnings",
    description: "Warnings raised during the fit calculation.",
  },
  {
    key: "validationWarnings",
    title: "Validation warnings",
    description: "Validation-specific warnings or notes.",
  },
  {
    key: "adjustmentPriorities",
    title: "Adjustment priorities",
    description: "Prioritized adjustments already attached to the run.",
  },
];

function hasRenderableValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length > 0;
  }

  return true;
}

export function formatTraceValue(value: unknown) {
  if (value === null || value === undefined) {
    return "Not recorded";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function collectFitTraceArtifacts(detail: FitRunTraceDetail) {
  const session = detail.session as Record<string, unknown>;

  return TRACE_FIELDS.flatMap((field) => {
    const value = session[field.key];
    if (!hasRenderableValue(value)) {
      return [];
    }

    return [
      {
        key: field.key,
        title: field.title,
        description: field.description,
        value,
      } satisfies FitTraceArtifact,
    ];
  });
}
