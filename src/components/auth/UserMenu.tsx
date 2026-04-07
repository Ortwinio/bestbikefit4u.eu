"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/prototyper-ui/ui/button";
import { useDashboardMessages } from "@/i18n/useDashboardMessages";
import { withLocalePrefix } from "@/i18n/navigation";
import { getEffectiveDisplayName } from "@/lib/userIdentity";
import { User, LogOut, Settings, ChevronDown, LayoutDashboard, Bike } from "lucide-react";

export function UserMenu() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { locale, messages } = useDashboardMessages();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get current user info
  const user = useQuery(
    api.users.queries.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(withLocalePrefix(path, locale));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push(withLocalePrefix("/", locale));
  };

  if (!isAuthenticated) {
    return null;
  }

  const displayName = getEffectiveDisplayName(user, messages.userMenu.fallbackUserName);
  const email = user?.email || "";

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
        className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="hidden text-sm font-medium text-foreground sm:block">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-card py-2 shadow-overlay">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/dashboard");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              {messages.userMenu.dashboard}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/fit");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              {messages.userMenu.newFitSession}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/bikes");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Bike className="h-4 w-4 text-muted-foreground" />
              {messages.userMenu.myBikes}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/profile");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              {messages.userMenu.profileSettings}
            </Button>
          </div>

          {/* Sign out */}
          <div className="border-t border-border pt-1">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive-soft"
            >
              <LogOut className="h-4 w-4" />
              {messages.common.signOut}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
