import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { cn } from "@/utils/cn";

export function MarketingLogo({ href, className, priority = false }: {
  href: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href={href} className={cn(className, "flex min-h-11 min-w-11 items-center")}>
      <Image
        src={BRAND.assets.logoPrimary}
        alt={BRAND.name}
        width={381}
        height={64}
        priority={priority}
        className="block h-auto w-full object-contain dark:hidden"
      />
      <Image
        src={BRAND.assets.logoDark}
        alt={BRAND.name}
        width={381}
        height={64}
        priority={priority}
        className="hidden h-auto w-full object-contain dark:block"
      />
    </Link>
  );
}
