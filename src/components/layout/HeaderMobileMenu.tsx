"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
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

  const close = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    close();
    router.push(withLocalePrefix("/", locale));
  };

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="outline"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center px-0 text-gray-700"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-gray-200 bg-white px-4 py-4 shadow-sm">
          <nav className="space-y-2">
            <Link
              href={withLocalePrefix("/about", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {labels.howItWorks}
            </Link>
            <Link
              href={withLocalePrefix("/bandenspanning-calculator", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {labels.tools}
            </Link>
            <Link
              href={withLocalePrefix("/pricing", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {labels.pricing}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href={withLocalePrefix("/dashboard", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {labels.dashboard}
                </Link>
                <Link
                  href={withLocalePrefix("/fit", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {labels.newFitSession}
                </Link>
                <Link
                  href={withLocalePrefix("/fit-history", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {labels.bikeFitting}
                </Link>
                <Link
                  href={withLocalePrefix("/bikes", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {labels.myBikes}
                </Link>
                <Link
                  href={withLocalePrefix("/profile", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {labels.profile}
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  className="mt-2 w-full justify-start text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {labels.signOut}
                </Button>
              </>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <Link href={withLocalePrefix("/login", locale)} onClick={close}>
                  <Button variant="ghost" size="sm">
                    {labels.login}
                  </Button>
                </Link>
                <Link href={withLocalePrefix("/login", locale)} onClick={close}>
                  <Button size="sm">{labels.getStarted}</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
