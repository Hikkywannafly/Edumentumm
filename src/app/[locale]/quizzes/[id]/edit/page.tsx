"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { QuizEditorContent } from "@/components/quizzes/edit";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useQuizCacheStore } from "@/stores/quiz-cache-store";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { BackendQuizEntity } from "@/types/quiz";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuizEditorPage() {
  const params = useParams();
  const quizId = params.id as string;
  const { setQuizData } = useQuizEditorStore();
  const { getCachedQuiz } = useQuizCacheStore();
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations("Quizzes");

  useEffect(() => {
    if (quizId) {
      loadQuiz(Number.parseInt(quizId));
    }
  }, [quizId]);

  const loadQuiz = async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const cachedQuiz = getCachedQuiz(id);

      if (cachedQuiz) {
        setQuizData(convertBackendToFrontend(cachedQuiz));
        setIsLoading(false);
        return;
      }
      const response = await fetch(`/api/quiz/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load quiz: ${response.status}`);
      }

      const quiz: BackendQuizEntity = await response.json();

      useQuizCacheStore.getState().cacheQuiz(quiz);

      setQuizData(convertBackendToFrontend(quiz));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const convertBackendToFrontend = (quiz: BackendQuizEntity) => {
    const quizDataObj =
      quiz.quizData instanceof Map
        ? Object.fromEntries(quiz.quizData)
        : quiz.quizData;

    return {
      title: quiz.title,
      description: quiz.description || "",
      questions: quizDataObj?.questions || [],
      settings: quizDataObj?.settings || {},
      metadata: {
        ...quizDataObj?.metadata,
        savedQuizId: quiz.id,
        isAutoSaved: true,
        lastSavedAt: quiz.updatedAt || new Date().toISOString(),
      },
    };
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
        {/* Header */}
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
        {/* Main Content */}
        <QuizEditorContent />
      </div>
    </DashboardLayout>
  );
}
