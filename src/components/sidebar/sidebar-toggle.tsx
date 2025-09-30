"use client";

import { Button } from "@/components/ui/button";
import { useSidebarContext } from "@/contexts/sidebar-context";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function SidebarToggle() {
  const { isMobile, isMobileOpen, setIsMobileOpen } = useSidebarContext();
  const t = useTranslations("Navigation");

  if (!isMobile) {
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
