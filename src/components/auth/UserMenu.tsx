"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui";
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {displayName}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/dashboard");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <LayoutDashboard className="h-4 w-4 text-gray-400" />
              {messages.userMenu.dashboard}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/fit");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              {messages.userMenu.newFitSession}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/bikes");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Bike className="h-4 w-4 text-gray-400" />
              {messages.userMenu.myBikes}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate("/profile");
              }}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 text-gray-400" />
              {messages.userMenu.profileSettings}
            </Button>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 pt-1">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="flex w-full items-center justify-start gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
