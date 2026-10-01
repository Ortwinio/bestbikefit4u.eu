import { AccountPerformanceCalculator } from "@/components/calculators/AccountPerformanceCalculator";
import { performanceMessages } from "@/i18n/calculators/performance";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return { title: performanceMessages[locale].titles["ftp-wkg"], robots: { index: false, follow: false } };
}
export default function CalculatorPage() {
  return <AccountPerformanceCalculator calculator="ftp-wkg" />;
}
