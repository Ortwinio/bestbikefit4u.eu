import { describe, expect, it } from "vitest";
import {
  displayAdminUserName,
  formatAdminDate,
  formatAdminRelativeDate,
  normalizeAdminOrganizationMemberRow,
  normalizeAdminOrganizationRow,
  normalizeAdminUserRow,
} from "./live-admin-data";

describe("live admin data helpers", () => {
  it("falls back through the display name chain", () => {
    expect(
      displayAdminUserName({ displayName: "Alex", name: "Alexandra", email: "alex@example.com" })
    ).toBe("Alex");
    expect(displayAdminUserName({ name: "Alexandra", email: "alex@example.com" })).toBe("Alexandra");
    expect(displayAdminUserName({ email: "alex@example.com" })).toBe("alex@example.com");
  });

  it("formats dates consistently", () => {
    expect(formatAdminDate(0)).toBe("—");
    expect(formatAdminRelativeDate(0)).toBe("—");
  });

  it("normalizes live admin rows", () => {
    expect(
      normalizeAdminUserRow({
        _id: "user_1",
        email: "rider@example.com",
        name: "Rider",
        displayName: "Rider One",
        tier: "premium",
        adminRole: "ops_admin",
        suspendedAt: undefined,
        lastLoginAt: 1234,
        createdAt: 1000,
      } as never)
    ).toMatchObject({
      id: "user_1",
      name: "Rider One",
      email: "rider@example.com",
      tier: "premium",
      adminRole: "ops_admin",
    });

    expect(
      normalizeAdminOrganizationRow({
        _id: "org_1",
        name: "Org",
        slug: "org",
        type: "enterprise",
        ownerUserId: "user_1",
        maxSeats: 12,
        usedSeats: 8,
        createdAt: 2000,
      } as never)
    ).toMatchObject({
      id: "org_1",
      name: "Org",
      type: "enterprise",
      maxSeats: 12,
      usedSeats: 8,
    });

    expect(
      normalizeAdminOrganizationMemberRow({
        _id: "member_1",
        organizationId: "org_1",
        userId: "user_1",
        role: "owner",
        joinedAt: 2000,
        user: {
          displayName: "Rider One",
          name: "Rider",
          email: "rider@example.com",
        },
      } as never)
    ).toMatchObject({
      id: "member_1",
      organizationId: "org_1",
      userId: "user_1",
      name: "Rider One",
      email: "rider@example.com",
      role: "owner",
    });
  });
});
