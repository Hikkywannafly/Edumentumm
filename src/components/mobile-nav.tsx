"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useQuizNavigationContext } from "@/contexts/quiz-navigation-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { BookOpen, LogOut, Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { QuizExitConfirmationDialog } from "./quizzes/take/quiz-exit-confirmation-dialog";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );
  const t = useTranslations("Header");
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showNavigationWarning } = useQuizNavigationContext();

  const navigateWithWarning = useCallback(
    (path: string) => {
      if (showNavigationWarning()) {
        setPendingNavigation(path);
        setShowExitDialog(true);
        setOpen(false); // Close the mobile menu
      } else {
        router.push(path);
        setOpen(false); // Close the mobile menu
      }
    },
    [showNavigationWarning, router],
  );

  const handleLogout = async () => {
    try {
      await logout();
      const locale = getLocaleFromPathname(pathname);
      navigateWithWarning(`/${locale}`);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] bg-background sm:w-[400px]"
        >
          <div className="mb-6 flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">{t("title")}</span>
          </div>
          <nav className="flex flex-col space-y-4">
            <button
              type="button"
              className="text-left font-medium text-lg transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("features")}
            </button>
            <button
              type="button"
              className="text-left font-medium text-lg transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("courses")}
            </button>
            <button
              type="button"
              className="text-left font-medium text-lg transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("community")}
            </button>
            <button
              type="button"
              className="text-left font-medium text-lg transition-colors hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {t("about")}
            </button>
          </nav>
          <div className="mt-8 flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleDashboard}
                  className="w-full justify-start"
                >
                  {t("dashboard")}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Button onClick={handleLogin} className="w-full">
                {t("login")}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <QuizExitConfirmationDialog
        isOpen={showExitDialog}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  );
}
