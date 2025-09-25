import { useAuth } from "@/contexts/auth-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useAuthGuard() {
  const { isAuthenticated, hasRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isPublicPage = useMemo(() => {
    const publicPages = ["/", "/login", "/register"];
    return publicPages.some((page) => {
      if (page === "/") {
        return pathname === "/" || pathname.match(/^\/[a-z]{2}$/);
      }
      return pathname.includes(page);
    });
  }, [pathname]);

  const locale = useMemo(() => getLocaleFromPathname(pathname), [pathname]);

  const shouldRedirect = useMemo(() => {
    if (isLoading) return null;

    if (!isAuthenticated && !isPublicPage) {
      return `/${locale}/login`;
    }

    if (isAuthenticated && !hasRole && !pathname.includes("/setup")) {
      return `/${locale}/setup`;
    }

    if (
      isAuthenticated &&
      hasRole &&
      (pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/setup"))
    ) {
      return `/${locale}`;
    }

    return null;
  }, [isAuthenticated, hasRole, isLoading, pathname, locale, isPublicPage]);

  const handleRedirect = useCallback(
    (url: string) => {
      // Clear any existing timeout
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }

      // Immediate redirect for better UX
      router.push(url);
    },
    [router],
  );

  // Handle redirects with debounce
  useEffect(() => {
    if (shouldRedirect) {
      handleRedirect(shouldRedirect);
    }

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [shouldRedirect, handleRedirect]);

  // Memoize render conditions
  const shouldRender = useMemo(() => {
    // Don't render if loading
    if (isLoading) return false;

    // Don't render if not authenticated and on protected page
    if (!isAuthenticated && !isPublicPage) return false;

    // Don't render if authenticated without role and not on setup
    if (isAuthenticated && !hasRole && !pathname.includes("/setup"))
      return false;

    // Don't render if there's a pending redirect
    if (shouldRedirect) return false;

    return true;
  }, [
    isAuthenticated,
    hasRole,
    isLoading,
    pathname,
    isPublicPage,
    shouldRedirect,
  ]);

  return {
    isLoading,
    shouldRender,
    isAuthenticated,
    hasRole,
    isPublicPage,
  };
}
