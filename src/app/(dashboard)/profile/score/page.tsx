import type { Metadata } from "next";
import { getRequestLocale } from "@/i18n/request";
import { getProfileScoreCopy } from "@/i18n/account/profileScore";
import { ProfileScoreExplainer } from "@/components/profile/ProfileScoreExplainer";

export async function generateMetadata(): Promise<Metadata> {
  const copy = getProfileScoreCopy(await getRequestLocale());
  return { title: copy.pageTitle, description: copy.description,
    openGraph: { title: copy.pageTitle, description: copy.description },
    robots: { index: false, follow: false } };
}

export default async function ProfileScorePage() {
  return <ProfileScoreExplainer locale={await getRequestLocale()} />;
}
