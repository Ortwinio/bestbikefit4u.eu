import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FitStatusPill, ReviewStatusPill, engineStatusTone, reviewStatusTone } from "./fit-ui";

describe("fit admin ui helpers", () => {
  it("maps engine statuses to the expected tones", () => {
    expect(engineStatusTone("active")).toBe("success");
    expect(engineStatusTone("qa")).toBe("warning");
    expect(engineStatusTone("draft")).toBe("info");
    expect(engineStatusTone("deprecated")).toBe("neutral");
  });

  it("maps review statuses to the expected tones", () => {
    expect(reviewStatusTone("required")).toBe("warning");
    expect(reviewStatusTone("reviewed")).toBe("success");
    expect(reviewStatusTone("overridden")).toBe("info");
    expect(reviewStatusTone("not_required")).toBe("neutral");
  });

  it("renders pill labels for fit statuses", () => {
    const html = renderToStaticMarkup(<FitStatusPill status="qa" />);
    expect(html).toContain("qa");

    const reviewHtml = renderToStaticMarkup(<ReviewStatusPill status="required" />);
    expect(reviewHtml).toContain("required");
  });
});
