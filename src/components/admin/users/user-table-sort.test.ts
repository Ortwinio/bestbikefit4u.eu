import { describe, expect, it } from "vitest";
import { getDefaultUserSortDirection, sortAdminUsers, type LiveAdminUserRow } from "./user-table-sort";

const users: LiveAdminUserRow[] = [
  {
    id: "u_1",
    name: "Bram Rider",
    email: "bram@example.com",
    tier: "pro",
    adminRole: "ops_admin",
    suspendedAt: null,
    createdAt: 1_000,
    lastLoginAt: 1_500,
  },
  {
    id: "u_2",
    name: "Anna Rider",
    email: "anna@example.com",
    tier: "premium",
    adminRole: null,
    suspendedAt: 2_500,
    createdAt: 3_000,
    lastLoginAt: 5_000,
  },
  {
    id: "u_3",
    name: "Celine Rider",
    email: "celine@example.com",
    tier: "free",
    adminRole: "support_admin",
    suspendedAt: 1_500,
    createdAt: 2_000,
    lastLoginAt: null,
  },
];

describe("user table sort helpers", () => {
  it("defaults last login sorting to descending", () => {
    expect(getDefaultUserSortDirection("lastLoginAt")).toBe("desc");
    expect(getDefaultUserSortDirection("createdAt")).toBe("desc");
    expect(getDefaultUserSortDirection("name")).toBe("asc");
  });

  it("sorts by last login with newest sessions first and missing values last", () => {
    expect(sortAdminUsers(users, "lastLoginAt", "desc").map((user) => user.id)).toEqual([
      "u_2",
      "u_1",
      "u_3",
    ]);
  });

  it("sorts alphabetical columns in ascending order", () => {
    expect(sortAdminUsers(users, "email", "asc").map((user) => user.id)).toEqual([
      "u_2",
      "u_1",
      "u_3",
    ]);
  });

  it("sorts suspension by active versus suspended state and suspension date", () => {
    expect(sortAdminUsers(users, "suspension", "asc").map((user) => user.id)).toEqual([
      "u_1",
      "u_3",
      "u_2",
    ]);
    expect(sortAdminUsers(users, "suspension", "desc").map((user) => user.id)).toEqual([
      "u_2",
      "u_3",
      "u_1",
    ]);
  });
});
