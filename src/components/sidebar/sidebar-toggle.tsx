"use client";

import { Button } from "@/components/ui/button";
import { useSidebarContextSafe } from "@/contexts/sidebar-context";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function SidebarToggle() {
  const { isMobile, isMobileOpen, setIsMobileOpen } = useSidebarContextSafe();
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  // Check if we're on the landing page (root path or locale root)
  // Matches: "/", "/en", "/vi", "/en/", "/vi/" etc.
  const isLandingPage = pathname === "/" || /^\/[a-z]{2}(\/)?$/.test(pathname);

  if (!isMobile || isLandingPage) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="mr-2 md:hidden"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      aria-label={isMobileOpen ? t("closeSidebar") : t("openSidebar")}
    >
      {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  );
}
