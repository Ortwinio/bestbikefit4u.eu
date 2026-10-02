import { en } from "./en";
import { nl, type EmailCopy } from "./nl";

export type EmailLocale = "nl" | "en";
export type { EmailCopy } from "./nl";
export const emailCopy: Record<EmailLocale, EmailCopy> = { nl, en };
