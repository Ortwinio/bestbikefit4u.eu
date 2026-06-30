import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { listPublicGuideRedirectRecords } from "@/lib/guides/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const secret = process.env.INTERNAL_REDIRECT_FETCH_SECRET;
  if (secret) {
    const header = request.headers.get("x-bbf-redirect-secret");
    if (header !== secret) {
      return new NextResponse(null, { status: 403 });
    }
  }

  const redirects = await listPublicGuideRedirectRecords();

  return NextResponse.json(
    redirects.map((redirect) => ({
      from: redirect.from,
      to: redirect.to,
      statusCode: redirect.statusCode,
    })),
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=60",
      },
    }
  );
}
