// src/components/auth/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, getStoredUser } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      Loading...
    </div>
  ),
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setIsChecking(false);

      if (!authenticated) {
        // Store current URL to redirect back after login
        const currentPath = window.location.pathname + window.location.search;
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`
        );
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking) {
    return <>{fallback}</>;
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
