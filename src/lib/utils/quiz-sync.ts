import { useQuizCacheStore } from "@/stores/quiz-cache-store";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import type { BackendQuizEntity, GeneratedQuiz } from "@/types/quiz";

/**
 * Utility functions for synchronizing quiz data between backend and frontend stores
 */

/**
 * Convert backend quiz entity to frontend format
 */
export function convertBackendToFrontend(
  quiz: BackendQuizEntity,
): GeneratedQuiz {
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
      category: quiz.categoryId?.toString() || quizDataObj?.metadata?.category,
      tags: quiz.tags || quizDataObj?.metadata?.tags || [],
      total_questions: quizDataObj?.questions?.length || 0,
      total_points:
        quizDataObj?.questions?.reduce(
          (sum: number, q: any) => sum + (q.points || 1),
          0,
        ) || 0,
      estimated_time:
        quiz.estimatedTime || quizDataObj?.metadata?.estimated_time || 10,
    },
  };
}

export async function loadQuizSafely(
  quizId: number,
  accessToken: string,
): Promise<{ success: boolean; quiz?: GeneratedQuiz; error?: string }> {
  try {
    console.log("🔄 Loading quiz safely from backend:", quizId);

    useQuizEditorStore.getState().forceReset();

    const response = await fetch(`/api/quiz/${quizId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load quiz: ${response.status}`);
    }

    const backendQuiz: BackendQuizEntity = await response.json();
    console.log("✅ Loaded fresh quiz from backend:", backendQuiz.id);

    // Update cache
    useQuizCacheStore.getState().cacheQuiz(backendQuiz);

    // Convert and return
    const frontendQuiz = convertBackendToFrontend(backendQuiz);

    return {
      success: true,
      quiz: frontendQuiz,
    };
  } catch (error) {
    console.error("❌ Failed to load quiz safely:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export function clearAllQuizData(): void {
  useQuizEditorStore.getState().forceReset();
}

export function syncQuizAfterSave(
  savedQuiz: BackendQuizEntity,
  clearOldData = true,
): GeneratedQuiz {
  console.log("🔄 Syncing quiz after save:", savedQuiz.id);

  if (clearOldData) {
    clearAllQuizData();
  }

  useQuizCacheStore.getState().cacheQuiz(savedQuiz);

  const frontendQuiz = convertBackendToFrontend(savedQuiz);

  return frontendQuiz;
}
