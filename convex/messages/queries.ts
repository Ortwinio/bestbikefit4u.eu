import { query } from "../_generated/server";
import { requireUserId } from "../lib/authz";

export const getMyMessages = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const [messages, targets, receipts, user, integration, fitSession] = await Promise.all([
      ctx.db.query("dashboard_messages").collect(),
      ctx.db.query("message_targets").collect(),
      ctx.db.query("message_receipts").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.get(userId),
      ctx.db
        .query("integrations")
        .withIndex("by_user_and_provider", (q) => q.eq("userId", userId).eq("provider", "strava"))
        .unique(),
      ctx.db.query("fitSessions").withIndex("by_user", (q) => q.eq("userId", userId)).first(),
    ]);

    const receiptByMessageId = new Map(receipts.map((receipt) => [receipt.messageId, receipt]));
    const groupedTargets = new Map<string, Array<(typeof targets)[number]>>();
    for (const target of targets) {
      const list = groupedTargets.get(String(target.messageId)) ?? [];
      list.push(target);
      groupedTargets.set(String(target.messageId), list);
    }

    return messages
      .filter((message) => message.status === "published")
      .filter((message) => !message.startsAt || message.startsAt <= now)
      .filter((message) => !message.expiresAt || message.expiresAt > now)
      .filter((message) => !message.pausedAt)
      .filter((message) => {
        const receipt = receiptByMessageId.get(message._id);
        if (receipt?.dismissedAt) return false;
        if (receipt?.acknowledgedAt && message.requiresAcknowledgement) return false;

        const messageTargets = groupedTargets.get(String(message._id)) ?? [];
        if (messageTargets.length === 0) return false;

        return messageTargets.some((target) => {
          switch (target.targetType) {
            case "all":
              return true;
            case "user":
              return target.targetValue === userId;
            case "plan":
              return target.targetValue === user?.tier;
            case "locale":
              return target.targetValue === "all";
            case "strava_connected":
              return target.targetValue === String(integration?.accessStatus === "active");
            case "fit_completed":
              return target.targetValue === String(Boolean(fitSession));
            default:
              return false;
          }
        });
      })
      .sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt));
  },
});
