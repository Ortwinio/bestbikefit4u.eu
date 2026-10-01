import type { ReactNode } from "react";
import { getRequestLocale } from "@/i18n/request";
import { getAccountMetadata } from "@/i18n/account/metadata";

export async function generateMetadata() {
  return getAccountMetadata(await getRequestLocale(), "profile");
}

export default function AccountPageLayout({ children }: { children: ReactNode }) {
  return children;
}
