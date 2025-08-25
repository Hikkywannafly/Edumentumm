import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { clearAllQuizData } from "@/lib/utils/quiz-sync";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useCallback } from "react";

export function useQuizNavigation() {
  const { goQuizEdit } = useLocalizedNavigation();
  const { quizData } = useQuizEditorStore();

  const navigateToEdit = useCallback(
    (quizId: number, clearCurrentData = true) => {
      if (clearCurrentData) {
        clearAllQuizData();
      }
      goQuizEdit(quizId);
    },
    [goQuizEdit],
  );

  const navigateToCreate = useCallback(() => {
    clearAllQuizData();
  }, []);

  const navigateWithConfirmation = useCallback(
    (destination: string, hasUnsavedChanges = false) => {
      if (hasUnsavedChanges && quizData) {
        const confirmed = window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        );
        if (!confirmed) {
          return false;
        }
      }
      clearAllQuizData();
      window.location.href = destination;
      return true;
    },
    [quizData],
  );

  const hasUnsavedChanges = useCallback(() => {
    if (!quizData || !quizData.metadata) return false;
    const metadata = quizData.metadata as any;
    return !metadata.savedQuizId;
  }, [quizData]);

  return {
    navigateToEdit,
    navigateToCreate,
    navigateWithConfirmation,
    hasUnsavedChanges: hasUnsavedChanges(),
  };
}
