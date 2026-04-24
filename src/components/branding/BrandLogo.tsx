"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/utils/cn";

const LOGO_ASSETS = {
  primary: {
    src: BRAND.assets.logoPrimary,
    width: 1024,
    height: 1024,
  },
  dark: {
    src: BRAND.assets.logoDark,
    width: 1024,
    height: 1024,
  },
  mark: {
    src: BRAND.assets.mark,
    width: 1024,
    height: 1024,
  },
  appIcon: {
    src: BRAND.assets.appIconSvg,
    width: 1024,
    height: 1024,
  },
} as const;

type BrandLogoAsset = keyof typeof LOGO_ASSETS;

type BrandLogoProps = {
  href?: string;
  asset?: BrandLogoAsset;
  className?: string;
  imageClassName?: string;
  priority?: boolean | "dark";
  ariaLabel?: string;
};

export function BrandLogo({
  href,
  asset = "primary",
  className,
  imageClassName,
  priority = false,
  ariaLabel,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const isAppIcon = asset === "appIcon";

  const selectedAsset =
    asset === "primary"
      ? priority === "dark"
        ? LOGO_ASSETS.dark
        : resolvedTheme === "dark"
          ? LOGO_ASSETS.dark
          : LOGO_ASSETS.primary
      : isAppIcon
        ? LOGO_ASSETS.mark
      : LOGO_ASSETS[asset];

  const image = isAppIcon ? (
    <span
      className={cn(
        "flex aspect-square w-full items-center justify-center overflow-hidden rounded-[22%] border p-[18%] shadow-[0_14px_28px_-20px_color-mix(in_oklch,var(--foreground)_28%,transparent)] transition-colors",
        resolvedTheme === "dark"
          ? "border-[color:color-mix(in_oklch,var(--dashboard-border-strong)_56%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--dashboard-sidebar-elevated)_88%,var(--primary)_12%)_0%,color-mix(in_oklch,var(--dashboard-sidebar)_92%,var(--background)_8%)_100%)]"
          : "border-[color:color-mix(in_oklch,var(--dashboard-border-soft)_88%,transparent)] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background)_96%,white_4%)_0%,color-mix(in_oklch,var(--dashboard-surface-muted)_94%,var(--background)_6%)_100%)]",
        imageClassName
      )}
    >
      <Image
        src={selectedAsset.src}
        alt={ariaLabel ?? BRAND.name}
        width={selectedAsset.width}
        height={selectedAsset.height}
        priority={priority === true || priority === "dark"}
        className="h-auto w-full"
      />
    </span>
  ) : (
    <Image
      src={selectedAsset.src}
      alt={ariaLabel ?? BRAND.name}
      width={selectedAsset.width}
      height={selectedAsset.height}
      priority={priority === true || priority === "dark"}
      className={cn("h-auto w-full", imageClassName)}
    />
  );

  if (!href) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link href={href} aria-label={ariaLabel ?? BRAND.name} className={className}>
      {image}
    </Link>
  );
}
