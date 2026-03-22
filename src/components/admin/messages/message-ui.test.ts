import { describe, expect, it } from "vitest";
import {
  messagePriorityLabel,
  messagePriorityTone,
  messageStatusLabel,
  messageStatusTone,
  messageTypeLabel,
  messageTypeTone,
} from "./message-ui";

describe("message ui helpers", () => {
  it("maps message types to labels and tones", () => {
    expect(messageTypeLabel("release_announcement")).toBe("Release announcement");
    expect(messageTypeTone("safety_alert")).toBe("danger");
    expect(messageTypeTone("upgrade_prompt")).toBe("info");
  });

  it("maps message statuses to labels and tones", () => {
    expect(messageStatusLabel("paused")).toBe("Paused");
    expect(messageStatusTone("scheduled")).toBe("info");
    expect(messageStatusTone("expired")).toBe("neutral");
  });

  it("maps message priorities to labels and tones", () => {
    expect(messagePriorityLabel("normal")).toBe("Normal");
    expect(messagePriorityTone("urgent")).toBe("danger");
    expect(messagePriorityTone("low")).toBe("neutral");
  });
});
