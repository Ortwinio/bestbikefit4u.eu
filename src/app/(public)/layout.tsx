import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getRequestLocale } from "@/i18n/request";
import { getDictionary } from "@/i18n/getDictionary";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        locale={locale}
        labels={{ common: dictionary.common, nav: dictionary.nav }}
      />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer
        locale={locale}
        labels={{
          howItWorks: dictionary.nav.howItWorks,
          pricing: dictionary.nav.pricing,
          footer: dictionary.nav.footer,
        }}
      />
    </div>
  );
}
