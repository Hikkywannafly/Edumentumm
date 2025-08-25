"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { QuizEditorContent } from "@/components/quizzes/edit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { loadQuizSafely } from "@/lib/utils/quiz-sync";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuizEditorPage() {
  const params = useParams();
  const quizId = params.id as string;
  const { setQuizData, forceReset } = useQuizEditorStore();
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations("Quizzes");

  useEffect(() => {
    if (quizId) {
      forceReset();
      loadQuiz(Number.parseInt(quizId));
    }
  }, [quizId, forceReset]);

  const loadQuiz = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadQuizSafely(id, accessToken || "");
      if (result.success && result.quiz) {
        setQuizData(result.quiz);
      } else {
        throw new Error(result.error || "Failed to load quiz");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
            <p>Loading quiz...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center text-red-600">
            <p>Error loading quiz: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        <PageHeaderClient
          title={t("edit.title")}
          action={
            <div className="flex gap-2">
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("edit.backToQuizzes")}
                </Button>
              </LocalizedLink>
            </div>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />
        <QuizEditorContent />
      </div>
    </DashboardLayout>
  );
}
