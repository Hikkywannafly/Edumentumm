"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSidebarContext } from "@/contexts/sidebar-context";
import { useSubscription } from "@/hooks/use-subscription";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";
import { Notification } from "../notification";
import { SettingMenu } from "../setting-menu";

interface PageHeaderClientProps {
  title: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showThemeToggle?: boolean;
  showLanguageSwitcher?: boolean;
  showUpgradeButton?: boolean;
}

export function PageHeaderClient({
  title,
  action,
  children,
  className = "",
  showThemeToggle = true,
  showLanguageSwitcher = true,
  showUpgradeButton = true,
}: PageHeaderClientProps) {
  const { isExpanded } = useSidebarContext();
  const t = useTranslations("Header");
  const { goPricing } = useLocalizedNavigation();
  const { subscription, loading } = useSubscription();
  const isProUser = subscription?.hasActiveSubscription || false;

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-20 flex h-16 items-center gap-3 bg-background ${
        isExpanded ? "pl-64" : "pl-16"
      } ${className}`}
    >
      <div className="mx-auto flex w-full items-center justify-between gap-2 px-4">
        <h1 className="font-semibold text-xl">{title}</h1>
        <div className="flex-1">{children}</div>

        <div className="flex items-center gap-2">
          {showUpgradeButton && !isProUser && !loading && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="hidden md:block"
            >
              <Button
                onClick={goPricing}
                className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg transition-all duration-300 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl"
                size="sm"
              >
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: -4 }}
                  className="flex items-center gap-1"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 15, 0, -15, 0],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    <Crown className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                  </motion.div>
                  <span className="relative z-10 font-medium">
                    {t("upgrade")}
                  </span>
                </motion.div>
                <motion.div
                  className="absolute inset-0 bg-white opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute top-0 left-0 h-full w-0 bg-gradient-to-r from-white/30 to-white/20"
                  whileHover={{
                    width: "100%",
                    transition: { duration: 0.5 },
                  }}
                />
                <motion.div
                  className="-top-1 -right-1 absolute flex h-3 w-3 items-center justify-center rounded-full bg-red-500"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 1,
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                >
                  <motion.span
                    className="font-bold text-white text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    !
                  </motion.span>
                </motion.div>
              </Button>
            </motion.div>
          )}
          {action && <div>{action}</div>}
          {showThemeToggle && <ThemeToggle />}
          <Notification />
          {showLanguageSwitcher && <LanguageSwitcher />}
          <SettingMenu />
        </div>
      </div>
    </header>
  );
}
