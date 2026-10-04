import type { Locale } from "@/i18n/config";
import { checkoutCopy } from "@/i18n/marketing/checkout";
import styles from "./CheckoutFlow.module.css";

export function AppointmentBlock({ locale, agendaUrl, showHeading = true }: { locale: Locale; agendaUrl?: string; showHeading?: boolean }) {
  const text = checkoutCopy[locale];
  return <section aria-label={text.planAppointment}>
    {showHeading && <h2>{text.planAppointment}</h2>}
    <p>{text.appointmentLead}</p>
    {agendaUrl ? <a className={`${styles.primary} ${styles.pinnedAction}`} href={agendaUrl} target="_blank" rel="noopener noreferrer">{text.planAppointment}</a> : <p>{text.agendaPlaceholder}</p>}
    <p className={styles.small}>{text.appointmentTerms}</p>
  </section>;
}
