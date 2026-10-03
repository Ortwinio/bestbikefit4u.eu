"use client";

import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/brand";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/utils/cn";

const LOGO_ASSETS = {
  primary: {
    src: BRAND.assets.logoPrimary,
    width: 381,
    height: 64,
  },
  dark: {
    src: BRAND.assets.logoDark,
    width: 381,
    height: 64,
  },
  mark: {
    src: BRAND.assets.mark,
    width: 64,
    height: 64,
  },
  appIcon: {
    src: BRAND.assets.appIconSvg,
    width: 64,
    height: 64,
  },
} as const;

type BrandLogoAsset = keyof typeof LOGO_ASSETS;

type BrandLogoProps = {
  href?: string;
  asset?: BrandLogoAsset;
  className?: string;
  imageClassName?: string;
  priority?: boolean | "dark";
};

export function BrandLogo({
  href,
  asset = "primary",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const shouldPrioritize = priority === true || priority === "dark";

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
      alt={BRAND.name}
      width={selectedAsset.width}
      height={selectedAsset.height}
      priority={shouldPrioritize}
      className={cn("block h-auto w-full object-contain", imageClassName)}
    />
  );

  if (!href) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link
      href={href}
      className={cn(className, "flex min-h-11 min-w-11 items-center")}
    >
      {image}
    </Link>
  );
}
