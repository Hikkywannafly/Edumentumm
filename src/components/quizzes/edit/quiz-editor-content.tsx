"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { useQuizEditor } from "@/hooks/quiz/use-quiz-editor";
import { useQuizSettingsSaver } from "@/hooks/quiz/use-quiz-settings-saver";
import { extractIdFromSlug } from "@/utils/index";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { QuizDescriptionEditor } from "./quiz-description-editor";
import { QuizEditorHeader } from "./quiz-editor-header";
import { QuizEditorSkeleton } from "./quiz-editor-skeleton";
import { QuizQuestionsEditor } from "./quiz-questions-editor";
import { QuizSettingsDialog } from "./quiz-settings-dialog";
import { QuizTagsEditor } from "./quiz-tags-categories-editor";
import { QuizTitleEditor } from "./quiz-title-editor";

export function QuizEditorContent() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.slug as string;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    quiz,
    isLoading,
    isError,
    error,
    updateQuiz,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    saveQuiz,
    isSaving,
    hasUnsavedChanges,
    changedFields,
  } = useQuizEditor(extractIdFromSlug(quizId));

  // Use the settings saver hook
  const { saveSettings, isSaving: isSettingsSaving } = useQuizSettingsSaver(
    extractIdFromSlug(quizId),
  );

  // Extract commonly used values
  const currentTitle = quiz?.title || "";
  const currentDescription = quiz?.description || "";
  const safeQuestions = Array.isArray(quiz?.questions) ? quiz.questions : [];

  // Validation logic
  const validateQuizForCreation = useCallback(() => {
    if (!currentTitle.trim()) return false;
    if (!safeQuestions.length) return false;

    return safeQuestions.every((question) => {
      if (
        question.type === "MULTIPLE_CHOICE" ||
        question.type === "TRUE_FALSE"
      ) {
        return question.answers.some((answer) => answer.isCorrect);
      }
      return true;
    });
  }, [currentTitle, safeQuestions]);

  const [isValidForCreation, setIsValidForCreation] = useState(false);

  useEffect(() => {
    setIsValidForCreation(validateQuizForCreation());
  }, [validateQuizForCreation]);

  // Event handlers
  const handleSaveQuiz = async () => {
    try {
      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes to save");
        return;
      }

      console.log("Saving changed fields:", changedFields);
      await saveQuiz();

      await queryClient.invalidateQueries({
        queryKey: ["quiz", extractIdFromSlug(quizId)],
      });

      toast.success("Quiz saved successfully!");
    } catch (error) {
      console.error("Failed to save quiz:", error);
      toast.error("Failed to save quiz. Please try again.");
    }
  };

  const handleSaveSettings = async (settings: any) => {
    try {
      const result = await saveSettings(settings);
      toast.success("Quiz settings saved successfully!");

      await queryClient.invalidateQueries({
        queryKey: ["quiz", extractIdFromSlug(quizId)],
      });
      await queryClient.invalidateQueries({
        queryKey: ["quiz-editing", extractIdFromSlug(quizId)],
      });

      await queryClient.invalidateQueries({
        queryKey: ["quizzes"],
      });

      return result;
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
      throw error;
    }
  };

  const handleNavigateAway = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Are you sure you want to leave? You have unsaved changes.",
      );
      if (!confirmed) {
        toast.warning("Please save your changes before leaving.");
        return;
      }
      toast.info("Unsaved changes will be lost.");
    }
    router.back();
  };

  const handleUpdateTitle = (newTitle: string) => {
    updateQuiz({ title: newTitle });
  };

  const handleUpdateDescription = (newDescription: string) => {
    updateQuiz({ description: newDescription });
  };

  const handleUpdateQuestion = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion.id, updatedQuestion);
    setIsValidForCreation(validateQuizForCreation());
  };

  const handleMoveQuestionUp = (id: string) => {
    const index = safeQuestions.findIndex((q) => q.id === id);
    if (index > 0) {
      moveQuestion(index, index - 1);
    }
  };

  const handleMoveQuestionDown = (id: string) => {
    const index = safeQuestions.findIndex((q) => q.id === id);
    if (index < safeQuestions.length - 1) {
      moveQuestion(index, index + 1);
    }
  };

  const handleAddQuestionAfter = (afterIndex: number) => {
    const newQuestion = {
      id: crypto.randomUUID(),
      question: "<p>New Question</p>",
      type: "MULTIPLE_CHOICE" as const,
      difficulty: "MEDIUM" as const,
      bloom_level: "UNDERSTAND" as const,
      points: 1,
      order_index: afterIndex + 1,
      answers: [
        {
          id: crypto.randomUUID(),
          text: "<p>Option A</p>",
          isCorrect: false,
          order_index: 1,
        },
        {
          id: crypto.randomUUID(),
          text: "<p>Option B</p>",
          isCorrect: true,
          order_index: 2,
        },
      ],
    };

    const updatedQuestions = [...safeQuestions];
    updatedQuestions.splice(afterIndex + 1, 0, newQuestion);

    updateQuiz({
      questions: updatedQuestions,
      metadata: {
        ...quiz?.metadata,
        total_questions: updatedQuestions.length,
        total_points: updatedQuestions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
      },
    });

    setIsValidForCreation(validateQuizForCreation());
    toast.success("Question added successfully!");
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion(id);
    setIsValidForCreation(validateQuizForCreation());
    toast.success("Question deleted successfully!");
  };

  const handleTagsChange = (tags: string[]) => {
    if (quiz) {
      const currentMetadata = quiz.metadata || {
        total_questions: safeQuestions.length,
        total_points: safeQuestions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.ceil(safeQuestions.length * 1.5),
        tags: [],
      };
      updateQuiz({
        metadata: {
          ...currentMetadata,
          tags,
        },
      });
      toast.success("Tags updated successfully!");
    }
  };

  // Render logic
  if (isLoading) {
    return <QuizEditorSkeleton />;
  }

  if (isError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading quiz: {error?.message || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="text-lg">No quiz data found.</div>
          <div className="text-muted-foreground text-sm">
            If you just created this quiz, it might still be processing. Please
            wait a moment and refresh the page.
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ThinLayout>
      <div className="space-y-1">
        <QuizEditorHeader
          onSaveQuiz={handleSaveQuiz}
          onBack={handleNavigateAway}
          canCreate={isValidForCreation}
          canSave={!!quiz && hasUnsavedChanges}
          isCreating={false}
          isSaving={isSaving}
          onShowSettings={() => setIsSettingsOpen(true)}
        />

        {/* Validation Status */}
        <div className="px-4">
          {!currentTitle.trim() && (
            <div className="text-red-500 text-sm">⚠️ Title is required</div>
          )}
          {!safeQuestions.length && (
            <div className="text-red-500 text-sm">
              ⚠️ At least one question is required
            </div>
          )}
          {safeQuestions.some(
            (q) =>
              (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") &&
              !q.answers.some((a) => a.isCorrect),
          ) && (
            <div className="text-red-500 text-sm">
              ⚠️ Each question must have at least one correct answer
            </div>
          )}
        </div>

        <QuizTitleEditor
          title={currentTitle}
          onTitleChange={handleUpdateTitle}
        />
        <QuizDescriptionEditor
          description={currentDescription}
          onDescriptionChange={handleUpdateDescription}
        />
        <QuizTagsEditor
          tags={quiz.metadata?.tags || []}
          onTagsChange={handleTagsChange}
        />
        <QuizQuestionsEditor
          questions={safeQuestions}
          onAddQuestion={(question) => addQuestion(question)}
          onAddQuestionAfter={handleAddQuestionAfter}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onMoveQuestionUp={handleMoveQuestionUp}
          onMoveQuestionDown={handleMoveQuestionDown}
        />
      </div>

      <QuizSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        quiz={quiz}
        onSave={handleSaveSettings}
        isSaving={isSettingsSaving}
      />
    </ThinLayout>
  );
}
