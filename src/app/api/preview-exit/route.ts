import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { withLocalePrefix } from "@/i18n/navigation";

export async function GET(request: Request) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.json({ error: "preview_auth_required" }, { status: 403 });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const localeParam = url.searchParams.get("locale");
  const locale = localeParam === "nl" ? "nl" : "en";
  const draft = await draftMode();

  draft.disable();

  const destination = slug
    ? withLocalePrefix(`/guides/${slug}`, locale)
    : withLocalePrefix("/guides", locale);

  return NextResponse.redirect(new URL(destination, url));
}
