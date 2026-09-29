"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/prototyper-ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/prototyper-ui/ui/dialog";
import { MarketingLogo } from "./MarketingLogo";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { getMarketingLayoutMessages } from "@/i18n/marketing/layout";
import { Menu, X } from "lucide-react";

type HeaderMobileMenuProps = {
  locale: Locale;
  labels: {
    howItWorks: string;
    tools: string;
    pricing: string;
    login: string;
    getStarted: string;
    dashboard: string;
    newFitSession: string;
    bikeFitting: string;
    myBikes: string;
    profile: string;
    signOut: string;
  };
};

export function HeaderMobileMenu({ locale, labels }: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const copy = getMarketingLayoutMessages(locale);
  const close = () => setIsOpen(false);
  const publicLinks = [
    { path: "/calculators/bike-fit", label: copy.calculators },
    { path: "/how-it-works", label: labels.howItWorks },
    { path: "/guides", label: copy.guides },
    { path: "/pricing", label: labels.pricing },
  ];
  const accountLinks = [
    { path: "/dashboard", label: labels.dashboard },
    { path: "/fit", label: labels.newFitSession },
    { path: "/fit-history", label: labels.bikeFitting },
    { path: "/bikes", label: labels.myBikes },
    { path: "/profile", label: labels.profile },
  ];
  async function handleSignOut() {
    await signOut();
    close();
    router.push(withLocalePrefix("/", locale));
  }
  return (
    <div className="xl:hidden">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          render={
            <Button
              id="mobile-navigation-trigger"
              type="button"
              variant="ghost"
              aria-label={isOpen ? copy.closeMenu : copy.openMenu}
              aria-expanded={isOpen}
              className="size-11 rounded-full p-0 text-[var(--bbf-inkt)]"
            />
          }
        >
          {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </DialogTrigger>
        <DialogContent
          side="top"
          showCloseButton={false}
          className={
            "max-h-[90dvh] overflow-y-auto border-b border-[var(--bbf-rand)] " +
            "bg-[var(--bbf-papier)] p-5 text-[var(--bbf-inkt)]"
          }
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{copy.navigation}</DialogTitle>
            <DialogDescription>{copy.menuDescription}</DialogDescription>
          </DialogHeader>
          <div className="mb-6 flex items-center justify-between gap-4">
            <MarketingLogo
              href={withLocalePrefix("/", locale)}
              className="block w-[200px]"
            />
            <button
              type="button"
              onClick={close}
              aria-label={copy.closeMenu}
              className="flex size-11 items-center justify-center rounded-full hover:bg-[var(--bbf-petrol-zacht)]"
            >
              <X className="size-6" />
            </button>
          </div>
          <nav aria-label={copy.navigation} className="space-y-1">
            {publicLinks.map((item) => (
              <Link
                key={item.path}
                href={withLocalePrefix(item.path, locale)}
                onClick={close}
                aria-current={pathname === withLocalePrefix(item.path, locale) ? "page" : undefined}
                className={
                  "flex min-h-12 items-center rounded-xl px-3 text-lg font-semibold " +
                  "hover:bg-[var(--bbf-petrol-zacht)] aria-[current=page]:bg-[var(--bbf-lime)]"
                }
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-[var(--bbf-rand)] pt-4">
              {isAuthenticated ? (
                <div className="mb-4">
                  {accountLinks.map((item) => (
                    <Link
                      key={item.path}
                      href={withLocalePrefix(item.path, locale)}
                      onClick={close}
                      className="flex min-h-11 items-center rounded-xl px-3 font-semibold hover:bg-[var(--bbf-petrol-zacht)]"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="min-h-11 px-3 font-semibold hover:underline"
                  >
                    {labels.signOut}
                  </button>
                </div>
              ) : (
                <Link
                  href={withLocalePrefix("/login", locale)}
                  onClick={close}
                  className="mb-3 flex min-h-11 items-center justify-center font-semibold hover:underline"
                >
                  {labels.login}
                </Link>
              )}
              <Link
                href={withLocalePrefix("/calculators/bike-fit", locale)}
                onClick={close}
                className={
                  "flex min-h-12 items-center justify-center rounded-full bg-[var(--bbf-petrol)] px-6 " +
                  "font-bold text-white hover:bg-[var(--bbf-petrol-hover)]"
                }
              >
                {copy.start}
              </Link>
            </div>
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}
