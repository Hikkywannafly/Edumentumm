"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronUp,
  Info,
  MoreVertical,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface QuizEditorHeaderProps {
  // onCreateQuiz: () => void;
  onSaveQuiz?: () => void;
  onDeleteQuiz?: () => void;
  onShowSettings?: () => void;
  onShowInfo?: () => void;
  onBack?: () => void;
  canCreate: boolean;
  canSave?: boolean;
  isCreating?: boolean;
  isSaving?: boolean;
  quizTitle?: string;
}

export function QuizEditorHeader({
  // onCreateQuiz,
  onSaveQuiz,
  onDeleteQuiz,
  onShowSettings,
  onShowInfo,
  // canCreate,
  canSave = false,
  // isCreating = false,
  isSaving = false,
}: QuizEditorHeaderProps) {
  const t = useTranslations("Quizzes");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Main Header */}
      <div
        className={`sticky top-0 z-50 mx-2 w-full bg-background/95 backdrop-blur transition-all duration-200 supports-[backdrop-filter]:bg-background/60 ${
          isScrolled ? "border-gray-200 border-b" : "border-gray-200 border-b"
        }`}
      >
        <div className="flex w-full items-center justify-end p-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={scrollToTop}
              size="sm"
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t("editor.backToTop")}</span>
            </Button>
            {onShowSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowSettings}
                className="hidden items-center gap-2 sm:flex"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">{t("editor.settings")}</span>
              </Button>
            )}

            {canSave && onSaveQuiz && (
              <Button
                variant="outline"
                onClick={onSaveQuiz}
                disabled={isSaving}
                className="hidden items-center gap-2 sm:flex"
              >
                <Save className="h-4 w-4" />
                {isSaving ? t("editor.saving") : t("editor.save")}
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isScrolled && (
                  <>
                    <DropdownMenuItem
                      onClick={scrollToTop}
                      className="sm:hidden"
                    >
                      <ChevronUp className="mr-2 h-4 w-4" />
                      {t("editor.backToTop")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}
                {onShowSettings && (
                  <>
                    <DropdownMenuItem
                      onClick={onShowSettings}
                      className="sm:hidden"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t("editor.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}

                {canSave && onSaveQuiz && (
                  <>
                    <DropdownMenuItem
                      onClick={onSaveQuiz}
                      disabled={isSaving}
                      className="sm:hidden"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? t("editor.saving") : t("editor.save")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="sm:hidden" />
                  </>
                )}
                {onShowInfo && (
                  <DropdownMenuItem onClick={onShowInfo}>
                    <Info className="mr-2 h-4 w-4" />
                    {t("editor.quizInfo")}
                  </DropdownMenuItem>
                )}
                {onShowInfo && onDeleteQuiz && <DropdownMenuSeparator />}
                {onDeleteQuiz && (
                  <DropdownMenuItem
                    onClick={onDeleteQuiz}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("editor.deleteQuiz")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </>
  );
}
