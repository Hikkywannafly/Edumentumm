import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";

import type React from "react";
import { SettingMenu } from "../setting-menu";

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
}

export function PageHeader({
  title,
  action,
  children,
  className = "",
  showThemeToggle = true,
  showLanguageSwitcher = true,
}: PageHeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 flex h-16 w-full items-center gap-3 bg-background px-4 ${className}`}
    >
      {/* Left side: Title */}
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="font-semibold text-xl">{title}</h1>

      {/* Center: Optional children content */}
      <div className="flex-1">{children}</div>

      {/* Right side: Actions and controls */}
      <div className="flex items-center gap-2">
        {/* Custom action button */}
        {action && <div>{action}</div>}
        {showThemeToggle && <ThemeToggle />}
        {showLanguageSwitcher && <LanguageSwitcher />}
        <SettingMenu />
      </div>
    </header>
  );
}
