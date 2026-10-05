import { AccountKneeAngle } from "@/components/reliability/account/AccountKneeAngle";
import { accountReliabilityMessages } from "@/i18n/account/reliability";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return { title: accountReliabilityMessages[locale].knee, robots: { index: false, follow: false } };
}

export default function KneeAnglePage() {
  return <AccountKneeAngle />;
}
