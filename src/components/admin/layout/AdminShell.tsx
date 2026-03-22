"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { CircuitBoard, Menu, X } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button, Card, CardContent } from "@/components/ui";
import { cn } from "@/utils/cn";
import { AdminStatusPill } from "./AdminUi";
import {
  adminNavigationGroups,
  getAdminNavigationItem,
  isAdminNavigationActive,
} from "./admin-navigation";
import {
  formatAdminRoleLabel,
  type AdminSessionUser,
} from "@/components/admin/auth/admin-auth-shared";

function AdminNavBlock({
  pathname,
  user,
  onNavigate,
  onSignOut,
}: {
  pathname: string;
  user: AdminSessionUser;
  onNavigate?: () => void;
  onSignOut?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[color:var(--border)] px-5 py-5">
        <Link href="/admin/overview" className="block" onClick={onNavigate}>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm">
              <CircuitBoard className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                BestBikeFit4U
              </p>
              <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 px-3 py-4">
        {adminNavigationGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isAdminNavigationActive(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group block rounded-2xl border px-4 py-3 transition-all",
                      active
                        ? "border-[color:color-mix(in_oklch,var(--primary)_32%,var(--border))] bg-[color:color-mix(in_oklch,var(--primary)_12%,var(--secondary))] shadow-sm"
                        : "border-transparent hover:border-[color:var(--border)] hover:bg-[color:var(--accent)]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
                          active
                            ? "bg-[color:var(--primary)] text-[color:var(--primary-foreground)]"
                            : "bg-[color:var(--secondary)] text-[color:var(--muted-foreground)] group-hover:text-[color:var(--foreground)]"
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-0.5 text-xs leading-5 text-[color:var(--muted-foreground)]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-[color:var(--border)] p-4">
        <Card className="border-[color:var(--border)] bg-[color:var(--card)]">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
                Signed in as
              </p>
              <p className="text-sm font-semibold text-[color:var(--foreground)]">
                {user.name}
              </p>
              <p className="text-xs text-[color:var(--muted-foreground)]">
                {user.email}
              </p>
            </div>
            <AdminStatusPill tone="info" className="capitalize">
              {formatAdminRoleLabel(user.adminRole)}
            </AdminStatusPill>
            {onSignOut ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 rounded-xl"
                onClick={onSignOut}
              >
                Sign out
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
  user,
}: {
  children: ReactNode;
  user: AdminSessionUser;
}) {
  const pathname = usePathname() ?? "/admin/overview";
  const router = useRouter();
  const { signOut } = useAuthActions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeItem = getAdminNavigationItem(pathname);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_oklch,var(--background)_84%,var(--primary)_16%)_0%,var(--background)_34%,var(--background)_100%)] text-[color:var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_94%,var(--background)_6%)] lg:block">
          <AdminNavBlock pathname={pathname} user={user} onSignOut={handleSignOut} />
        </aside>

        <main className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-20 border-b border-[color:var(--border)] bg-[color:color-mix(in_oklch,var(--card)_92%,var(--background)_8%)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-foreground)]">
                  Admin control surface
                </p>
                <p className="truncate text-sm text-[color:var(--muted-foreground)]">
                  {activeItem.label} · {activeItem.description}
                </p>
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <AdminStatusPill tone="neutral">Prototyper UI</AdminStatusPill>
                <AdminStatusPill tone="info" className="capitalize">
                  {formatAdminRoleLabel(user.adminRole)}
                </AdminStatusPill>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>

              <Button
                variant="outline"
                className="lg:hidden"
                aria-expanded={isMobileMenuOpen}
                aria-label={
                  isMobileMenuOpen
                    ? "Close admin navigation"
                    : "Open admin navigation"
                }
                onClick={() => setIsMobileMenuOpen((current) => !current)}
              >
                {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[min(100%,20rem)] overflow-y-auto border-r border-[color:var(--border)] bg-[color:var(--card)] shadow-2xl">
            <AdminNavBlock
              pathname={pathname}
              user={user}
              onNavigate={() => setIsMobileMenuOpen(false)}
              onSignOut={async () => {
                await handleSignOut();
                setIsMobileMenuOpen(false);
              }}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
