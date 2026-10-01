import { AccountFitCalculator } from "@/components/calculators/AccountFitCalculator";
import { accountCalculatorMessages } from "@/i18n/account/calculators";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return { title: accountCalculatorMessages[locale].titles["crank-length"], robots: { index: false, follow: false } };
}

export default function CalculatorPage() {
  return <AccountFitCalculator calculator="crank-length" />;
}
