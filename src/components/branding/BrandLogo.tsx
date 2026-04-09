"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/utils/cn";

const LOGO_ASSETS = {
  primary: {
    src: BRAND.assets.logoPrimary,
    width: 1115,
    height: 222,
  },
  dark: {
    src: BRAND.assets.logoDark,
    width: 1115,
    height: 222,
  },
  mark: {
    src: BRAND.assets.mark,
    width: 512,
    height: 512,
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

  const selectedAsset =
    asset === "primary"
      ? priority === "dark"
        ? LOGO_ASSETS.dark
        : resolvedTheme === "dark"
          ? LOGO_ASSETS.dark
          : LOGO_ASSETS.primary
      : LOGO_ASSETS[asset];

  const image = (
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
