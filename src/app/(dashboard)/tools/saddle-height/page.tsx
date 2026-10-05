import { AccountSaddleHeight } from "@/components/reliability/account/AccountSaddleHeight";
import { accountCalculatorMessages } from "@/i18n/account/calculators";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return { title: accountCalculatorMessages[locale].titles["saddle-height"], robots: { index: false, follow: false } };
}

export default function CalculatorPage() {
  return <AccountSaddleHeight />;
}
