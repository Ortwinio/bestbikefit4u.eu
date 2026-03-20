import { PressureCalculatorDashboard } from "@/components/features/pressure/PressureCalculatorDashboard";

export default async function PressureCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ bikeId?: string }>;
}) {
  const params = await searchParams;

  return <PressureCalculatorDashboard initialBikeId={params.bikeId} />;
}
