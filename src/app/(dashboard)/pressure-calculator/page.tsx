import { PressureDashboardClient } from "./PressureDashboardClient";

export default async function PressureCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<{ bikeId?: string }>;
}) {
  const params = await searchParams;

  return <PressureDashboardClient initialBikeId={params.bikeId} />;
}
