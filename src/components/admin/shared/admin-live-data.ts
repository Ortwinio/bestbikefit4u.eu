import "server-only";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";

type PaginatedResult<T> = {
  page: T[];
  isDone: boolean;
  continueCursor: string;
};

export async function getAdminQueryToken() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/admin/login");
  }

  return token;
}

export async function fetchAdminQuery<T>(
  query: unknown,
  args: Record<string, unknown>,
  token?: string
): Promise<T> {
  const resolvedToken = token ?? (await getAdminQueryToken());
  return (await fetchQuery(query as never, args as never, {
    token: resolvedToken,
  })) as T;
}

export async function fetchAdminPaginatedQuery<T>(
  query: unknown,
  args: Record<string, unknown>,
  token?: string,
  pageSize = 100
): Promise<T[]> {
  const resolvedToken = token ?? (await getAdminQueryToken());
  const items: T[] = [];
  let cursor: string | null = null;

  while (true) {
    const result = (await fetchQuery(
      query as never,
      {
        ...args,
        paginationOpts: { numItems: pageSize, cursor },
      } as never,
      { token: resolvedToken }
    )) as PaginatedResult<T>;

    items.push(...result.page);
    if (result.isDone) {
      break;
    }
    cursor = result.continueCursor;
  }

  return items;
}

export async function fetchAdminUsers(token?: string): Promise<Doc<"users">[]> {
  return fetchAdminPaginatedQuery<Doc<"users">>(
    api.admin.queries.listUsers,
    {},
    token
  );
}

export async function fetchAdminBikes(token?: string): Promise<Doc<"bikes">[]> {
  return fetchAdminPaginatedQuery<Doc<"bikes">>(
    api.admin.queries.listAllBikes,
    {},
    token
  );
}
