import { renderLayout } from "./layout";

export { escapeHtml, primaryButton } from "./layout";

/** Compatibility wrapper for legacy senders while they migrate to typed templates. */
export function emailWrapper(body: string): string {
  return renderLayout({ locale: "en", subject: "BestBikeFit4U", preheader: "", content: body, footerReason: "" });
}
