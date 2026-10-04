import { CreateBikeForm } from "@/components/features/bikes/CreateBikeForm";
import { BikeCreationAccess } from "@/components/bikes/BikeCreationAccess";
import Link from "next/link";
import { getRequestLocale } from "@/i18n/request";
import { withLocalePrefix } from "@/i18n/navigation";
import { giftsCopy } from "@/i18n/account/gifts";

export default async function NewManualBikePage({
  searchParams,
}: {
  searchParams: Promise<{ gift?: string }>;
}) {
  const [params, locale] = await Promise.all([searchParams, getRequestLocale()]);
  return (
    <BikeCreationAccess>
      <CreateBikeForm />
      {params.gift === "1" && (
        <Link
          href={withLocalePrefix("/gift", locale)}
          className="mt-4 inline-flex min-h-11 items-center text-[var(--primary)] underline"
        >
          {giftsCopy[locale].returnToGift}
        </Link>
      )}
    </BikeCreationAccess>
  );
}
