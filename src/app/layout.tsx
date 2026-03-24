import type { Metadata } from "next";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { GTMConsentLoader } from "@/components/analytics/GTMConsentLoader";
import { FeedbackPanelProvider } from "@/components/feedback";
import { ToastProvider } from "@/components/ui";

const GTM_ID = "GTM-KH48ZSSC";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: BRAND.name,
  description: "AI-powered bike fitting application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale}>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem('theme')||'system';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}`,
            }}
          />
        </head>
        <body className="relative bg-[color:var(--background)] text-[color:var(--foreground)] antialiased">
          <a
            href="#main-content"
            className="skip-link absolute left-4 top-3 z-[100] rounded-md border border-[color:var(--border)] bg-[color:var(--card)] px-3 py-2 text-sm font-medium text-[color:var(--foreground)] shadow"
          >
            Skip to main content
          </a>
          <GTMConsentLoader gtmId={GTM_ID} />
          <ToastProvider>
            <ConvexClientProvider>
              <FeedbackPanelProvider>{children}</FeedbackPanelProvider>
            </ConvexClientProvider>
            <CookieConsentBanner locale={locale} />
          </ToastProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
