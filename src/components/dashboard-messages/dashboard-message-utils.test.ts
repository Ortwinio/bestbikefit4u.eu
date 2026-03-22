import { describe, expect, it } from "vitest";
import type { DashboardMessage } from "./types";
import {
  getDashboardMessageSurface,
  getDashboardMessageTone,
  groupDashboardMessages,
  sortDashboardMessages,
} from "./utils";

function buildMessage(overrides: Partial<DashboardMessage>): DashboardMessage {
  return {
    _id: "message_1" as DashboardMessage["_id"],
    _creationTime: 1,
    title: "Example message",
    body: "Body copy",
    type: "banner",
    priority: "normal",
    status: "published",
    dismissible: true,
    requiresAcknowledgement: false,
    createdAt: 1,
    createdBy: "user_1" as DashboardMessage["createdBy"],
    ...overrides,
  };
}

describe("dashboard message grouping", () => {
  it("groups messages into banner, home card, and modal surfaces", () => {
    const groups = groupDashboardMessages([
      buildMessage({ _id: "modal_1" as DashboardMessage["_id"], type: "modal", priority: "high" }),
      buildMessage({ _id: "home_1" as DashboardMessage["_id"], type: "release_announcement", priority: "low" }),
      buildMessage({ _id: "banner_1" as DashboardMessage["_id"], type: "safety_alert", priority: "urgent" }),
    ]);

    expect(groups.banners).toHaveLength(1);
    expect(groups.homeCards).toHaveLength(1);
    expect(groups.modalCandidates).toHaveLength(1);
    expect(getDashboardMessageSurface(groups.banners[0])).toBe("banner");
    expect(getDashboardMessageSurface(groups.homeCards[0])).toBe("home_card");
    expect(getDashboardMessageSurface(groups.modalCandidates[0])).toBe("modal");
  });

  it("sorts urgent and recent messages first", () => {
    const sorted = sortDashboardMessages([
      buildMessage({
        _id: "older_low" as DashboardMessage["_id"],
        priority: "low",
        createdAt: 1,
        publishedAt: 1,
      }),
      buildMessage({
        _id: "newer_high" as DashboardMessage["_id"],
        priority: "high",
        createdAt: 2,
        publishedAt: 2,
      }),
      buildMessage({
        _id: "urgent_recent" as DashboardMessage["_id"],
        priority: "urgent",
        createdAt: 3,
        publishedAt: 3,
      }),
    ]);

    expect(sorted[0]._id).toBe("urgent_recent");
    expect(sorted[1]._id).toBe("newer_high");
    expect(sorted[2]._id).toBe("older_low");
  });

  it("maps message types to tones", () => {
    expect(getDashboardMessageTone(buildMessage({ type: "release_announcement" }))).toBe("success");
    expect(getDashboardMessageTone(buildMessage({ type: "sticky_warning" }))).toBe("warning");
    expect(getDashboardMessageTone(buildMessage({ type: "safety_alert" }))).toBe("danger");
  });
});

