import { getConfidenceLabel, type PublicResultEnvelope } from "@/lib/publicCalculatorLogic";

type PublicCalculatorResultSummaryProps = {
  result: PublicResultEnvelope<unknown>;
  isNl?: boolean;
  extraNotes?: string[];
  validationMessages?: string[];
};

function ResultList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="public-calculator-card-subtle rounded-2xl border p-5">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-border/60 bg-card px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PublicCalculatorResultSummary({
  result,
  isNl = false,
  extraNotes = [],
  validationMessages = [],
}: PublicCalculatorResultSummaryProps) {
  const confidenceLabel = getConfidenceLabel(result.confidence.level, isNl);
  const validationIssues = result.validationIssues
    .filter((issue) => issue.severity !== "info")
    .map((issue) => issue.message);
  const combinedValidationMessages = [...validationMessages, ...validationIssues];

  return (
    <div className="mt-4 space-y-4">
      <div className="public-calculator-card-subtle rounded-2xl border p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          {isNl ? "Uitleg" : "Explanation"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          {isNl ? "Waarom dit resultaat veranderde" : "Why this result changed"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isNl ? "Betrouwbaarheid" : "Confidence"}: {confidenceLabel}
        </p>
        {result.nextAction ? (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {isNl ? "Volgende stap" : "Next best action"}:
            </span>{" "}
            {result.nextAction}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ResultList
          title={isNl ? "Belangrijkste drivers" : "Primary drivers"}
          items={result.primaryDrivers ?? []}
        />
        <ResultList
          title={isNl ? "Secundaire modifiers" : "Secondary modifiers"}
          items={result.secondaryModifiers ?? []}
        />
        <ResultList
          title={isNl ? "Niet afgedekt in deze tool" : "Not covered here"}
          items={result.notCovered ?? []}
        />
        <ResultList
          title={isNl ? "Controleer hierna" : "Validate next"}
          items={extraNotes}
        />
      </div>

      {combinedValidationMessages.length > 0 ? (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-4 text-sm text-amber-700 dark:text-amber-300">
          <p className="font-semibold">{isNl ? "Controlepunten" : "Validation notes"}</p>
          <ul className="mt-2 space-y-1">
            {combinedValidationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
