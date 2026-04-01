import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SignedInFitFollowUpCard } from "./SignedInFitFollowUpCard";

describe("SignedInFitFollowUpCard", () => {
  it("keeps the signed-in follow-up copy promise scoped to a better estimate", () => {
    const html = renderToStaticMarkup(
      <SignedInFitFollowUpCard
        locale="en"
        copy={{
          title: "Get a better estimate with your inseam and rider profile",
          description:
            "Use the quick check as a first screen. Add your rider data for a better estimate.",
          profileCta: "Add rider profile",
          fitCta: "Open bike fit",
        }}
        onCtaClick={vi.fn()}
      />
    );

    expect(html).toContain("Get a better estimate with your inseam and rider profile");
    expect(html).toContain(
      "Use the quick check as a first screen. Add your rider data for a better estimate."
    );
    expect(html).toContain("Add rider profile");
    expect(html).toContain("Open bike fit");
    expect(html).not.toContain("full fit score");
    expect(html).not.toContain("Profile Match");
  });
});
