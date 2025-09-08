"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSidebarContext } from "@/contexts/sidebar-context";
import type React from "react";
import { SettingMenu } from "../setting-menu";

interface PageHeaderClientProps {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
}

export function PageHeaderClient({
  title,
  action,
  children,
  className = "",
  showThemeToggle = true,
  showLanguageSwitcher = true,
}: PageHeaderClientProps) {
  const { isExpanded } = useSidebarContext();

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-20 flex h-16 items-center gap-3 bg-background ${
        isExpanded ? "pl-64" : "pl-16"
      } ${className}`}
    >
      <div className=" mx-auto flex w-full items-center justify-between gap-2 px-4">
        <h1 className="font-semibold text-xl">{title}</h1>
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-2">
          {action && <div>{action}</div>}

          {showThemeToggle && <ThemeToggle />}
          {showLanguageSwitcher && <LanguageSwitcher />}
          <SettingMenu />
        </div>
      </div>
    </header>
  );
}
