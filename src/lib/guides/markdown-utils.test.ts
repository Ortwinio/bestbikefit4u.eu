import { describe, expect, it } from "vitest";
import {
  extractFaqs,
  extractQuickAnswer,
  stripMarkdownSection,
  stripTrailingStandaloneCta,
} from "./markdown-utils";

describe("extractQuickAnswer", () => {
  it("extracts the quick answer fields from markdown", () => {
    const markdown = `
## Quick answer

**Key takeaway:** Start with one measured change.

**Most common mistake:** Changing too many things at once.

**Who should pay extra attention:**
- riders with recurring pain
- riders with new shoes
`;

    expect(extractQuickAnswer(markdown)).toEqual({
      keyTakeaway: "Start with one measured change.",
      commonMistake: "Changing too many things at once.",
      payAttention: "riders with recurring pain riders with new shoes",
    });
  });

  it("returns null when the section is missing or incomplete", () => {
    expect(extractQuickAnswer("## Intro\n\nNothing here")).toBeNull();
    expect(
      extractQuickAnswer("## Quick answer\n\n**Key takeaway:** A\n\n**Most common mistake:** B")
    ).toBeNull();
  });
});

describe("extractFaqs", () => {
  it("extracts multiple faq items and preserves markdown in answers", () => {
    const markdown = `
## FAQ

### Can fit cause knee pain?

Yes, especially when position and load interact.

### How much should I change?

Keep changes small:
- saddle height: 2 to 3 mm
- cleats: small resets
`;

    expect(extractFaqs(markdown)).toEqual([
      {
        q: "Can fit cause knee pain?",
        a: "Yes, especially when position and load interact.",
      },
      {
        q: "How much should I change?",
        a: "Keep changes small:\n- saddle height: 2 to 3 mm\n- cleats: small resets",
      },
    ]);
  });

  it("returns an empty array when faq section is missing or empty", () => {
    expect(extractFaqs("## Intro\n\nNo faq here")).toEqual([]);
    expect(extractFaqs("## FAQ\n\n|A|B|\n|---|---|")).toEqual([]);
  });
});

describe("markdown cleanup helpers", () => {
  it("removes extracted sections and trailing login ctas from markdown", () => {
    const markdown = `
Intro paragraph.

## Quick answer

**Key takeaway:** A

**Most common mistake:** B

**Who should pay extra attention:** C

## Body

Main content.

## FAQ

### Q

A

[Start Free Fit](/en/login)
`;

    const withoutQuickAnswer = stripMarkdownSection(markdown, "Quick answer");
    const withoutFaq = stripMarkdownSection(withoutQuickAnswer, "FAQ");
    const cleaned = stripTrailingStandaloneCta(withoutFaq);

    expect(cleaned).toContain("## Body");
    expect(cleaned).not.toContain("## Quick answer");
    expect(cleaned).not.toContain("## FAQ");
    expect(cleaned).not.toContain("[Start Free Fit](/en/login)");
  });
});
