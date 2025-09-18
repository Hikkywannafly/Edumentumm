"use client";

import { LanguageSwitcher } from "@/components/language-switcher";
import { LocalizedLink } from "@/components/localized-link";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useQuizNavigationContext } from "@/contexts/quiz-navigation-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { BookOpen, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import WideContainer from "./layout/wide-layout";
import { QuizExitConfirmationDialog } from "./quizzes/take/quiz-exit-confirmation-dialog";

interface HeaderClientProps {
  title?: string;
}

export function HeaderClient({ title }: HeaderClientProps) {
  const t = useTranslations("Header");
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showNavigationWarning } = useQuizNavigationContext();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const handleLogout = async () => {
    try {
      await logout();
      const locale = getLocaleFromPathname(pathname);
      router.push(`/${locale}`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigateWithWarning = useCallback(
    (path: string) => {
      if (showNavigationWarning()) {
        setPendingNavigation(path);
        setShowExitDialog(true);
      } else {
        router.push(path);
      }
    },
    [showNavigationWarning, router],
  );

  const handleDashboard = () => {
    const locale = getLocaleFromPathname(pathname);
    navigateWithWarning(`/${locale}/dashboard`);
  };

  const handleLogin = () => {
    const locale = getLocaleFromPathname(pathname);
    navigateWithWarning(`/${locale}/login`);
  };

  const handleConfirmExit = useCallback(() => {
    setShowExitDialog(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  const handleCancelExit = useCallback(() => {
    setShowExitDialog(false);
    setPendingNavigation(null);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <WideContainer classNames="container flex h-16 items-center justify-between">
          <LocalizedLink href="" className="flex items-center space-x-2">
            <div className="m-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">{title || t("title")}</span>
          </LocalizedLink>

          <nav className="hidden items-center space-x-6 md:flex">
            <a
              href="#features"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              {t("features")}
            </a>
            <a
              href="#courses"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              {t("courses")}
            </a>
            <a
              href="#community"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              {t("community")}
            </a>
            <a
              href="#about"
              className="font-medium text-sm transition-colors hover:text-primary"
            >
              {t("about")}
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleDashboard}
                  variant="default"
                  size="sm"
                  className="hidden md:flex"
                >
                  {t("dashboard")}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="hidden md:flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                variant="default"
                size="sm"
                className="hidden md:flex"
              >
                {t("login")}
              </Button>
            )}

            <MobileNav />
          </div>
        </WideContainer>
      </header>
      <QuizExitConfirmationDialog
        isOpen={showExitDialog}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  );
}
