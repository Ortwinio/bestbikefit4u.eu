"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { BrandLogo } from "@/components/branding";
import type { Locale } from "@/i18n/config";
import { withLocalePrefix } from "@/i18n/navigation";
import { Compass, Gauge, Menu, Sparkles, X } from "lucide-react";

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

  const publicLinks = [
    {
      href: withLocalePrefix("/how-it-works", locale),
      label: labels.howItWorks,
      icon: <Compass className="h-4 w-4 text-[color:var(--primary)]" />,
    },
    {
      href: withLocalePrefix("/bandenspanning-calculator", locale),
      label: labels.tools,
      icon: <Gauge className="h-4 w-4 text-[color:var(--primary)]" />,
    },
    {
      href: withLocalePrefix("/pricing", locale),
      label: labels.pricing,
      icon: <Sparkles className="h-4 w-4 text-[color:var(--primary)]" />,
    },
  ];

  return (
    <div className="md:hidden">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              className="inline-flex h-9 w-9 items-center justify-center px-0 text-muted-foreground"
            />
          }
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </DialogTrigger>
        <DialogContent
          side="top"
          className="border-b border-border-light bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background)_94%,var(--secondary)_6%)_0%,var(--background)_100%)] px-4 py-4"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Mobile navigation</DialogTitle>
            <DialogDescription>Site navigation and account actions.</DialogDescription>
          </DialogHeader>
          <BrandLogo
            href={withLocalePrefix("/", locale)}
            asset="primary"
            className="mb-4 block w-full max-w-[260px]"
          />
          <nav className="space-y-2">
            <div className="rounded-2xl border border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-2">
              {publicLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <>
                <Link
                  href={withLocalePrefix("/dashboard", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {labels.dashboard}
                </Link>
                <Link
                  href={withLocalePrefix("/fit", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {labels.newFitSession}
                </Link>
                <Link
                  href={withLocalePrefix("/fit-history", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {labels.bikeFitting}
                </Link>
                <Link
                  href={withLocalePrefix("/bikes", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {labels.myBikes}
                </Link>
                <Link
                  href={withLocalePrefix("/profile", locale)}
                  onClick={close}
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {labels.profile}
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  className="mt-2 w-full justify-start text-left text-sm"
                >
                  {labels.signOut}
                </Button>
              </>
            ) : (
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-[color:var(--border)]/80 bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] p-2">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
