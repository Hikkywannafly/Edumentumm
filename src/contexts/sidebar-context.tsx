"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";

interface SidebarContextType {
  isPinned: boolean;
  isHovered: boolean;
  isMobileOpen: boolean;
  setIsPinned: (pinned: boolean) => void;
  setIsHovered: (hovered: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  isExpanded: boolean;
  isMobile: boolean;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Load initial state from localStorage
  React.useEffect(() => {
    const savedPinnedState = localStorage.getItem("sidebar-pinned");
    if (savedPinnedState !== null) {
      setIsPinned(JSON.parse(savedPinnedState));
    }
  }, []);

  // Close mobile sidebar when switching to desktop
  React.useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen]);

  const isExpanded = isMobile ? isMobileOpen : isPinned || isHovered;

  return (
    <SidebarContext.Provider
      value={{
        isPinned,
        isHovered,
        isMobileOpen,
        setIsPinned,
        setIsHovered,
        setIsMobileOpen,
        isExpanded,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}

// Safe version that returns default values when context is not available
export function useSidebarContextSafe() {
  const context = React.useContext(SidebarContext);
  const isMobile = useIsMobile(); // Always get the mobile state

  if (context === undefined) {
    return {
      isPinned: false,
      isHovered: false,
      isMobileOpen: false,
      setIsPinned: () => {},
      setIsHovered: () => {},
      setIsMobileOpen: () => {},
      isExpanded: false,
      isMobile,
    };
  }
  return context;
}
