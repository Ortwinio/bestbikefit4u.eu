import { redirect } from "next/navigation";
import { withLocalePrefix } from "@/i18n/navigation";
import { getRequestLocale } from "@/i18n/request";
import { getLegacyUseCaseRedirect } from "@/lib/guides/redirects";
import { USE_CASE_SLUGS } from "../data";

interface UseCasePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return USE_CASE_SLUGS.map((slug) => ({ slug }));
}

export default async function UseCaseDetailPage({ params }: UseCasePageProps) {
  const locale = await getRequestLocale();
  const { slug } = await params;

  redirect(withLocalePrefix(getLegacyUseCaseRedirect(slug), locale));
}
