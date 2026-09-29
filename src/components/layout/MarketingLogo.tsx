import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";

export function MarketingLogo({ href, className, priority = false, ariaLabel = BRAND.name }: {
  href: string;
  className?: string;
  priority?: boolean;
  ariaLabel?: string;
}) {
  return (
    <Link href={href} className={className} aria-label={ariaLabel}>
      <Image src={BRAND.assets.logoPrimary} alt={ariaLabel} width={381} height={64}
        priority={priority} className="block h-auto w-full object-contain" />
    </Link>
  );
}
