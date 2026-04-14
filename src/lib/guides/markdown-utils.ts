export type QuickAnswer = {
  keyTakeaway: string;
  commonMistake: string;
  payAttention: string;
};

export type GuideFaqItem = {
  q: string;
  a: string;
};

function normalizeNewlines(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSectionBody(markdown: string, heading: string) {
  const normalized = normalizeNewlines(markdown);
  const pattern = new RegExp(
    `^##\\s+${escapeRegex(heading)}\\s*\\n([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`,
    "im"
  );
  const match = normalized.match(pattern);
  return match?.[1]?.trim() ?? null;
}

function cleanupInlineContent(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function getQuickAnswerField(section: string, label: string) {
  const marker = `**${label}:**`;
  const startIndex = section.indexOf(marker);
  if (startIndex === -1) {
    return "";
  }

  const afterMarker = section.slice(startIndex + marker.length);
  const nextFieldIndex = afterMarker.search(/\n\s*\*\*[^*]+:\*\*/);
  const rawValue =
    nextFieldIndex === -1 ? afterMarker.trim() : afterMarker.slice(0, nextFieldIndex).trim();

  return cleanupInlineContent(
    rawValue
      .split("\n")
      .map((line) => line.trim().replace(/^-+\s*/, ""))
      .filter(Boolean)
      .join(" ")
  );
}

export function extractQuickAnswer(markdown: string): QuickAnswer | null {
  const section = getSectionBody(markdown, "Quick answer");
  if (!section) {
    return null;
  }

  const keyTakeaway = getQuickAnswerField(section, "Key takeaway");
  const commonMistake = getQuickAnswerField(section, "Most common mistake");
  const payAttention =
    getQuickAnswerField(section, "Who should pay extra attention") ||
    getQuickAnswerField(section, "Pay extra attention if");

  if (!keyTakeaway || !commonMistake || !payAttention) {
    return null;
  }

  return {
    keyTakeaway,
    commonMistake,
    payAttention,
  };
}

export function extractFaqs(markdown: string): GuideFaqItem[] {
  const section = getSectionBody(markdown, "FAQ");
  if (!section) {
    return [];
  }

  const normalized = normalizeNewlines(section);
  const matches = [
    ...normalized.matchAll(
      /^###\s+(.+?)\s*$([\s\S]*?)(?=^###\s+|(?![\s\S]))/gm
    ),
  ];

  return matches
    .map((match) => ({
      q: cleanupInlineContent(match[1] ?? ""),
      a: (match[2] ?? "").trim().replace(/\n{3,}/g, "\n\n"),
    }))
    .filter((item) => item.q.length > 0 && item.a.length > 0);
}

export function stripMarkdownSection(markdown: string, heading: string) {
  const normalized = normalizeNewlines(markdown);
  const pattern = new RegExp(
    `\\n*^##\\s+${escapeRegex(heading)}\\s*$[\\s\\S]*?(?=^##\\s+|(?![\\s\\S]))`,
    "gim"
  );

  return normalized.replace(pattern, "\n").trim();
}

export function stripTrailingStandaloneCta(markdown: string) {
  return normalizeNewlines(markdown)
    .replace(/\n*\[([^\]]+)\]\((\/(?:en|nl)\/login)\)\s*$/i, "")
    .trim();
}
