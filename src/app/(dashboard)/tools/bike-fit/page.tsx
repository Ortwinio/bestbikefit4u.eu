import { AccountBikeFitCalculator } from "@/components/calculators/AccountBikeFitCalculator";
import { accountBikeFitCopy } from "@/i18n/account/bikeFitCalculator";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const copy = accountBikeFitCopy[locale];
  return { title: copy.title, description: copy.description, robots: { index: false, follow: false } };
}

export default function CalculatorPage() {
  return <AccountBikeFitCalculator />;
}
