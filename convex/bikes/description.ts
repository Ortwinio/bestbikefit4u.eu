type BikeDescriptionSource = "generated" | "template";

type GenerateBikeDescriptionInput = {
  locale: "en" | "nl";
  name: string;
  bikeType: string;
  brand?: string;
  model?: string;
  ridingStyle?: string;
  primaryGoal?: string;
  notes?: string;
  activitySummary?: {
    inferredBikeRole?: string;
    inferredRidingStyle?: string;
    totalDistanceKm?: number;
    commuteRatio?: number;
    trainerRatio?: number;
  } | null;
};

function formatBikeType(value: string) {
  return value.replace(/_/g, " ");
}

function formatToken(value?: string | null) {
  if (!value) {
    return null;
  }
  return value.replace(/_/g, " ");
}

export function buildBikeDescriptionTemplate(input: GenerateBikeDescriptionInput): string {
  const name = input.brand && input.model
    ? `${input.brand} ${input.model}`
    : input.name;
  const bikeType = formatBikeType(input.bikeType);
  const ridingStyle =
    formatToken(input.ridingStyle) ??
    formatToken(input.activitySummary?.inferredRidingStyle);
  const primaryGoal = formatToken(input.primaryGoal);
  const inferredRole = formatToken(input.activitySummary?.inferredBikeRole);

  if (input.locale === "nl") {
    const parts = [
      `${name} is mijn ${bikeType}-fiets`,
      ridingStyle ? `voor ${ridingStyle} ritten` : null,
      primaryGoal ? `met focus op ${primaryGoal}` : null,
      inferredRole ? `en voelt vooral als een ${inferredRole} setup` : null,
    ].filter(Boolean);
    return `${parts.join(" ")}. Ik gebruik deze fiets als vaste setup voor ritten waarin comfort, vertrouwen en een herkenbaar gevoel belangrijk zijn.`;
  }

  const parts = [
    `${name} is my ${bikeType} bike`,
    ridingStyle ? `for ${ridingStyle} riding` : null,
    primaryGoal ? `with an emphasis on ${primaryGoal}` : null,
    inferredRole ? `and it feels closest to a ${inferredRole} setup` : null,
  ].filter(Boolean);
  return `${parts.join(" ")}. I keep it as a dependable setup for rides where comfort, confidence, and familiarity matter most.`;
}

const BLOCKED_PATTERNS = [
  /\b(stack|reach|frame size|seat tube angle|head tube angle|geometry)\b/i,
  /\b\d{2,4}\s?(mm|cm|inch|inches|degrees|°)\b/i,
  /\bdefinitely\b/i,
  /\bexactly\b/i,
];

export function sanitizeGeneratedBikeDescription(description: string): string {
  const normalized = description
    .replace(/\s+/g, " ")
    .trim();

  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 3);
  const joined = sentences.join(" ").slice(0, 420).trim();

  const blocked = BLOCKED_PATTERNS.some((pattern) => pattern.test(joined));
  if (blocked || joined.length < 40) {
    throw new Error("Generated description did not meet safety rules");
  }

  return joined;
}

export async function generateBikeDescription(
  input: GenerateBikeDescriptionInput
): Promise<{ description: string; source: BikeDescriptionSource }> {
  const fallback = buildBikeDescriptionTemplate(input);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { description: fallback, source: "template" };
  }

  const prompt =
    input.locale === "nl"
      ? `Schrijf een korte fietsbeschrijving in het Nederlands. Gebruik alleen deze feiten: naam ${input.name}, merk ${input.brand ?? "onbekend"}, model ${input.model ?? "onbekend"}, fietstype ${input.bikeType}, rijstijl ${input.ridingStyle ?? input.activitySummary?.inferredRidingStyle ?? "onbekend"}, doel ${input.primaryGoal ?? "onbekend"}, notities ${input.notes ?? "geen"}. Vermijd geometrie, framemaat, exacte specificaties en verzonnen feiten. Geef maximaal 3 zinnen.`
      : `Write a short bike description in English. Use only these facts: name ${input.name}, brand ${input.brand ?? "unknown"}, model ${input.model ?? "unknown"}, bike type ${input.bikeType}, riding style ${input.ridingStyle ?? input.activitySummary?.inferredRidingStyle ?? "unknown"}, goal ${input.primaryGoal ?? "unknown"}, notes ${input.notes ?? "none"}. Avoid geometry, frame size, exact specs, and invented facts. Return at most 3 sentences.`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_BIKE_DESCRIPTION_MODEL || "gpt-4.1-mini",
      input: prompt,
      max_output_tokens: 180,
    }),
  });

  if (!response.ok) {
    return { description: fallback, source: "template" };
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };

  const text = payload.output_text;
  if (!text) {
    return { description: fallback, source: "template" };
  }

  try {
    return {
      description: sanitizeGeneratedBikeDescription(text),
      source: "generated",
    };
  } catch {
    return { description: fallback, source: "template" };
  }
}
