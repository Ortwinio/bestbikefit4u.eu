import { getRequestLocale } from "@/i18n/request";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getCheckoutPreview, parseCheckoutProduct, safeAgendaUrl } from "@/components/checkout/checkout-state";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const product = typeof params.product === "string" ? params.product : undefined;
  return <CheckoutClient locale={await getRequestLocale()}
    sessionId={typeof params.session_id === "string" ? params.session_id : undefined}
    cancelled={params.cancelled === "1"}
    appointmentRequested={params.appointment === "1"}
    initialSelection={product || params.bikeId ? { product: parseCheckoutProduct(product), bikeId: typeof params.bikeId === "string" ? params.bikeId : "" } : undefined}
    preview={getCheckoutPreview(typeof params.preview === "string" ? params.preview : undefined, process.env)}
    agendaUrl={safeAgendaUrl(process.env.PERSONAL_BIKEFIT_AGENDA_URL)} />;
}
