import type { Metadata } from "next";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";

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
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        </head>
        <body className="relative antialiased">
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          <a
            href="#main-content"
            className="skip-link absolute left-4 top-3 z-[100] rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow"
          >
            Skip to main content
          </a>
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <CookieConsentBanner locale={locale} />
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
