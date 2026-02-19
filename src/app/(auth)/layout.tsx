import Link from "next/link";
import { BRAND } from "@/config/brand";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8">
        <Link
          href={withLocalePrefix("/", locale)}
          className="text-2xl font-bold text-gray-900"
        >
          {BRAND.name}
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
