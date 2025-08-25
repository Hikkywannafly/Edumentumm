import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { clearAllQuizData } from "@/lib/utils/quiz-sync";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useCallback } from "react";

/**
 * Hook for safe navigation between quiz creation and editing
 * Handles data cleanup and proper state management
 */
export function useQuizNavigation() {
  const { goQuizEdit } = useLocalizedNavigation();
  const { quizData } = useQuizEditorStore();

  /**
   * Navigate to quiz edit page with proper data cleanup
   */
  const navigateToEdit = useCallback(
    (quizId: number, clearCurrentData = true) => {
      console.log(`🧭 Navigating to edit quiz ${quizId}`);

      if (clearCurrentData) {
        // Clear current data to prevent conflicts
        clearAllQuizData();
        console.log("🧹 Cleared data before navigation");
      }

      // Navigate to edit page
      goQuizEdit(quizId);
    },
    [goQuizEdit],
  );

  /**
   * Navigate to quiz creation with fresh state
   */
  const navigateToCreate = useCallback(() => {
    console.log("🧭 Navigating to quiz creation");

    // Always clear data when starting creation
    clearAllQuizData();
    console.log("🧹 Cleared data for new creation");

    // Navigate to create page (implement based on your routing)
    // This would typically be handled by your router
  }, []);

  /**
   * Safe navigation with user confirmation if unsaved changes exist
   */
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

      // Clear data and navigate
      clearAllQuizData();
      window.location.href = destination;
      return true;
    },
    [quizData],
  );

  /**
   * Check if there are unsaved changes
   */
  const hasUnsavedChanges = useCallback(() => {
    // Check if quiz exists but has no saved ID in metadata
    if (!quizData || !quizData.metadata) return false;
    const metadata = quizData.metadata as any; // Type assertion for savedQuizId
    return !metadata.savedQuizId;
  }, [quizData]);

  return {
    navigateToEdit,
    navigateToCreate,
    navigateWithConfirmation,
    hasUnsavedChanges: hasUnsavedChanges(),
  };
}
