import { describe, expect, it } from "vitest";
import { getDashboardMessageCopy } from "./copy";

describe("dashboard notification language", () => {
  it("translates Dutch notification types and preserves English", () => {
    expect(getDashboardMessageCopy("nl").types.release_announcement).toBe("Nieuwe update");
    expect(getDashboardMessageCopy("nl").types.support_reply).toBe("Reactie op je hulpvraag");
    expect(getDashboardMessageCopy("nl").actions.dismiss).toBe("Sluiten");
    expect(getDashboardMessageCopy("en").types.release_announcement).toBe("Release announcement");
    expect(getDashboardMessageCopy("en").types.support_reply).toBe("Support reply");
  });
});
