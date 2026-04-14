import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { withLocalePrefix } from "@/i18n/navigation";

function unauthorized(message: string, status = 401) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  return unauthorized("method_not_allowed", 405);
}

export async function POST(request: Request) {
  const url = new URL(request.url);

  let body: { id?: string; locale?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return unauthorized("preview_invalid_body", 400);
  }

  const id = body.id;
  const locale = body.locale === "nl" ? "nl" : "en";

  if (!id) {
    return unauthorized("preview_id_missing", 400);
  }

  const token = await convexAuthNextjsToken();
  if (!token) {
    return unauthorized("preview_auth_required", 403);
  }

  const guide = await fetchQuery(
    api.guides.queries.getDraftGuide,
    { id: id as Id<"guidePages"> },
    { token }
  );

  if (!guide) {
    return unauthorized("preview_guide_not_found", 404);
  }

  const draft = await draftMode();
  draft.enable();

  const destination = withLocalePrefix(
    `${guide.path}?draftId=${encodeURIComponent(id)}`,
    locale
  );
  return NextResponse.json({
    redirectTo: new URL(destination, url).toString(),
  });
}
