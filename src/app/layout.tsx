import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { headers } from "next/headers";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { BRAND } from "@/config/brand";
import { ANALYTICS_CONFIG } from "@/config/analytics";
import { getDictionary } from "@/i18n/getDictionary";
import { getRequestLocale } from "@/i18n/request";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";
import { GTMConsentLoader } from "@/components/analytics/GTMConsentLoader";
import { FeedbackPanelProvider } from "@/components/feedback";
import { ToastProvider } from "@/components/prototyper-ui/ui/toast";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NONCE_HEADER_NAME } from "@/lib/csp";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  applicationName: BRAND.name,
  title: BRAND.name,
  description: "Precision bike fitting for comfort, alignment, and performance.",
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      {
        url: "/logo/bestbikefit4u_mark.svg",
        type: "image/svg+xml",
      },
      {
        url: "/logo/bestbikefit4u_mark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: [
      {
        url: "/logo/bestbikefit4u_mark.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/logo/bestbikefit4u_icon_app.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logo/bestbikefit4u_mark.svg",
        color: "#089BE9",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#089BE9" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1F29" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);
  const nonce = (await headers()).get(NONCE_HEADER_NAME) ?? undefined;

  return (
    <ConvexAuthNextjsServerProvider>
      <html lang={locale}>
        <head>
          <script
            nonce={nonce}
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
            {dictionary.common.skipToContent}
          </a>
          <GTMConsentLoader gtmId={ANALYTICS_CONFIG.gtmId} nonce={nonce} />
          <ToastProvider>
            <ConvexClientProvider>
              <FeedbackPanelProvider>{children}</FeedbackPanelProvider>
            </ConvexClientProvider>
            <CookieConsentBanner locale={locale} />
          </ToastProvider>
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
