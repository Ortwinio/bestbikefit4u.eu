import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

interface AuditEvent {
  adminUserId: Id<"users">;
  action: string;
  targetType?: string;
  targetId?: string;
  payload?: Record<string, unknown>;
  reason?: string;
  ipAddress?: string;
}

export async function writeAuditLog(
  ctx: MutationCtx,
  event: AuditEvent
): Promise<void> {
  await ctx.db.insert("admin_audit_logs", {
    adminUserId: event.adminUserId,
    action: event.action,
    targetType: event.targetType,
    targetId: event.targetId,
    payload: event.payload ? JSON.stringify(event.payload) : undefined,
    reason: event.reason,
    ipAddress: event.ipAddress,
    occurredAt: Date.now(),
  });
}
