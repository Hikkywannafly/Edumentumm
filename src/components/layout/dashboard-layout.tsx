"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { ErrorBoundary } from "@/components/sidebar/error_boundary";
import { SidebarProvider, useSidebarContext } from "@/contexts/sidebar-context";
import type React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { isExpanded, isMobile } = useSidebarContext();

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-200 ease-in-out ${
          isMobile ? "ml-0" : isExpanded ? "ml-64" : "ml-16"
        }`}
      >
        <main
          className={`flex-1 overflow-y-auto ${isMobile ? "pt-0" : "pt-16"}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ErrorBoundary>
      <SidebarProvider>
        <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
    </ErrorBoundary>
  );
}
