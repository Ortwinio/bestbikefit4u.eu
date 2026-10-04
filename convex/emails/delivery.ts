"use node";

import { Resend } from "resend";
import { BRAND, emailSender } from "../lib/brand";
import type { EmailLocale, RenderedEmail } from "./templates";

export function emailActionUrl(locale: EmailLocale, path: string) {
  return `${(process.env.SITE_URL ?? BRAND.siteUrl).replace(/\/$/, "")}/${locale}${path}`;
}

export async function deliverEmail(
  recipient: string,
  email: RenderedEmail,
  options: { headers?: Record<string, string>; idempotencyKey?: string } = {}
) {
  if (!process.env.AUTH_RESEND_KEY) return null;
  const { data, error } = await new Resend(process.env.AUTH_RESEND_KEY).emails.send({
    from: emailSender(),
    to: [recipient], subject: email.subject, html: email.html, text: email.text,
    ...(options.headers ? { headers: options.headers } : {}),
  }, options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined);
  if (error) throw new Error("Email delivery failed: " + error.message);
  if (!data?.id) throw new Error("Email delivery returned no message ID");
  return data.id;
}
