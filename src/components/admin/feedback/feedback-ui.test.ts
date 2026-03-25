import { describe, expect, it } from "vitest";
import {
  feedbackPriorityLabel,
  feedbackPriorityTone,
  feedbackStatusLabel,
  feedbackStatusTone,
  feedbackTypeLabel,
  feedbackTypeTone,
} from "./feedback-ui";

describe("feedback ui helpers", () => {
  it("maps feedback types to labels and tones", () => {
    expect(feedbackTypeLabel("bug")).toBe("Bug");
    expect(feedbackTypeLabel("feature_request")).toBe("Feature request");
    expect(feedbackTypeLabel("review")).toBe("Review");
    expect(feedbackTypeTone("bug")).toBe("danger");
    expect(feedbackTypeTone("support_case")).toBe("neutral");
    expect(feedbackTypeTone("review")).toBe("success");
  });

  it("maps feedback statuses to labels and tones", () => {
    expect(feedbackStatusLabel("planned")).toBe("Planned");
    expect(feedbackStatusTone("in_progress")).toBe("info");
    expect(feedbackStatusTone("declined")).toBe("danger");
  });

  it("maps feedback priorities to labels and tones", () => {
    expect(feedbackPriorityLabel("urgent")).toBe("Urgent");
    expect(feedbackPriorityTone("high")).toBe("warning");
    expect(feedbackPriorityTone("low")).toBe("neutral");
  });
});
