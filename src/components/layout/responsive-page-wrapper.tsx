"use client";

import { useSidebarContextSafe } from "@/contexts/sidebar-context";
import type React from "react";

interface ResponsivePageWrapperProps {
  children: React.ReactNode;
  hasFixedHeader?: boolean;
  className?: string;
}

/**
 * ResponsivePageWrapper handles the responsive layout for pages with fixed headers
 * On mobile: no top padding (headers are not sticky)
 * On desktop: pt-16 for fixed headers
 */
export function ResponsivePageWrapper({
  children,
  hasFixedHeader = true,
  className = "",
}: ResponsivePageWrapperProps) {
  const { isMobile } = useSidebarContextSafe();

  return (
    <div
      className={`${hasFixedHeader && !isMobile ? "pt-16" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
