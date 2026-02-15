"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (isLoading) {
      return;
    }

    // Give a small delay for auth state to settle after page load
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      }
      setAuthChecked(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, router]);

  // Show loading state while auth is loading or checking
  if (isLoading || !authChecked) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )
    );
  }

  // Authenticated - render children
  return <>{children}</>;
}
