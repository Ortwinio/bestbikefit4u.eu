import { BrandLogo } from "@/components/branding";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();

  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--surface-secondary)] px-4 text-[color:var(--foreground)]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
        <div className="mb-8">
          <BrandLogo
            href={withLocalePrefix("/", locale)}
            asset="primary"
            className="block w-[468px]"
            imageClassName="block"
          />
        </div>
        <main id="main-content" tabIndex={-1} className="w-full max-w-md">
          {children}
        </main>
      </div>
    </div>
  );
}
