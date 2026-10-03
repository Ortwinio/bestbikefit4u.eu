import { generateLlmsDocument } from "@/lib/seo/llms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const headers = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(): Promise<Response> {
  return new Response(await generateLlmsDocument(true), { headers });
}

export function HEAD(): Response {
  return new Response(null, { headers });
}
