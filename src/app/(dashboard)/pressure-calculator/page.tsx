import { getDashboardMessages } from "@/i18n/dashboardMessages";
import { getRequestLocale } from "@/i18n/request";
import { PressureWizard } from "@/components/features/pressure/PressureWizard";

export default async function PressureCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ bikeId?: string }>;
}) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const messages = getDashboardMessages(locale);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {messages.pressure.wizard.title}
      </h1>
      <PressureWizard initialBikeId={params.bikeId} />
    </div>
  );
}
