"use client";

import * as React from "react";

interface SidebarContextType {
  isPinned: boolean;
  isHovered: boolean;
  setIsPinned: (pinned: boolean) => void;
  setIsHovered: (hovered: boolean) => void;
  isExpanded: boolean;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined,
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isPinned, setIsPinned] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  // Load initial state from localStorage
  React.useEffect(() => {
    const savedPinnedState = localStorage.getItem("sidebar-pinned");
    if (savedPinnedState !== null) {
      setIsPinned(JSON.parse(savedPinnedState));
    }
  }, []);

  const isExpanded = isPinned || isHovered;

  return (
    <SidebarContext.Provider
      value={{
        isPinned,
        isHovered,
        setIsPinned,
        setIsHovered,
        isExpanded,
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
