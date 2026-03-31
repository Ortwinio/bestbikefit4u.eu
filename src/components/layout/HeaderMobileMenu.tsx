"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/branding";
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
        className="inline-flex h-9 w-9 items-center justify-center px-0 text-[color:var(--muted-foreground)]"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-[color:var(--border)] bg-[color:var(--popover)] px-4 py-4 text-[color:var(--popover-foreground)] shadow-lg">
          <BrandLogo
            href={withLocalePrefix("/", locale)}
            asset="primary"
            className="mb-4 block w-[324px]"
          />
          <nav className="space-y-2">
            <Link
              href={withLocalePrefix("/how-it-works", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
            >
              {labels.howItWorks}
            </Link>
            <Link
              href={withLocalePrefix("/bandenspanning-calculator", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
            >
              {labels.tools}
            </Link>
            <Link
              href={withLocalePrefix("/pricing", locale)}
              onClick={close}
              className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
            >
              {labels.pricing}
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href={withLocalePrefix("/dashboard", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {labels.dashboard}
                </Link>
                <Link
                  href={withLocalePrefix("/fit", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {labels.newFitSession}
                </Link>
                <Link
                  href={withLocalePrefix("/fit-history", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {labels.bikeFitting}
                </Link>
                <Link
                  href={withLocalePrefix("/bikes", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {labels.myBikes}
                </Link>
                <Link
                  href={withLocalePrefix("/profile", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {labels.profile}
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  className="mt-2 w-full justify-start text-left text-sm text-[color:var(--muted-foreground)] hover:bg-[color:var(--accent)] hover:text-[color:var(--foreground)]"
                >
                  {labels.signOut}
                </Button>
              </>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <Button
                  render={
                    <Link
                      href={withLocalePrefix("/login", locale)}
                      onClick={close}
                    />
                  }
                  variant="ghost"
                  size="sm"
                >
                  {labels.login}
                </Button>
                <Button
                  render={
                    <Link
                      href={withLocalePrefix("/login", locale)}
                      onClick={close}
                    />
                  }
                  size="sm"
                >
                  {labels.getStarted}
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
