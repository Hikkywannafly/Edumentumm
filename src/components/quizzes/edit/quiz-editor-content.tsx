"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { useQuizEditor } from "@/hooks/quiz/use-quiz-editor";
import { extractIdFromSlug } from "@/utils/index";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QuizDescriptionEditor } from "./quiz-description-editor";
import { QuizEditorHeader } from "./quiz-editor-header";
import { QuizEditorSkeleton } from "./quiz-editor-skeleton";
import { QuizQuestionsEditor } from "./quiz-questions-editor";
import { QuizTagsEditor } from "./quiz-tags-categories-editor";
import { QuizTitleEditor } from "./quiz-title-editor";

export function QuizEditorContent() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.slug as string;
  const [isValidForCreation, setIsValidForCreation] = useState(false);

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
    hasUnsavedChanges,
  } = useQuizEditor(extractIdFromSlug(quizId));

  const currentTitle = quiz?.title || "";
  const currentDescription = quiz?.description || "";

  const validateQuizForCreation = useCallback(() => {
    if (!currentTitle.trim()) return false;
    if (!quiz?.questions?.length) return false;

    const hasValidQuestions = quiz.questions.every((question) => {
      if (
        question.type === "MULTIPLE_CHOICE" ||
        question.type === "TRUE_FALSE"
      ) {
        return question.answers.some((answer) => answer.isCorrect);
      }
      return true;
    });

    return hasValidQuestions;
  }, [currentTitle, quiz]);

  useEffect(() => {
    setIsValidForCreation(validateQuizForCreation());
  }, [validateQuizForCreation]);

  const handleNavigateAway = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Are you sure you want to leave? You have unsaved changes.",
      );
      if (!confirmed) return;
    }
    router.back();
  };

  // Loading state
  if (isLoading) {
    return <QuizEditorSkeleton />;
  }

  // Error state
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
    const index = quiz.questions.findIndex((q) => q.id === id);
    if (index > 0) {
      moveQuestion(index, index - 1);
    }
  };

  const handleMoveQuestionDown = (id: string) => {
    const index = quiz.questions.findIndex((q) => q.id === id);
    if (index < quiz.questions.length - 1) {
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

    // Insert the new question at the correct position
    if (!quiz) return;

    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(afterIndex + 1, 0, newQuestion);

    updateQuiz({
      questions: updatedQuestions,
      metadata: {
        ...quiz.metadata,
        total_questions: updatedQuestions.length,
        total_points: updatedQuestions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
      },
    });

    setIsValidForCreation(validateQuizForCreation());
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion(id);
    setIsValidForCreation(validateQuizForCreation());
  };

  const handleTagsChange = (tags: string[]) => {
    if (quiz) {
      const currentMetadata = quiz.metadata || {
        total_questions: quiz.questions.length,
        total_points: quiz.questions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.ceil(quiz.questions.length * 1.5),
        tags: [],
      };
      updateQuiz({
        metadata: {
          ...currentMetadata,
          tags,
        },
      });
    }
  };

  return (
    <ThinLayout>
      <div className="space-y-1">
        <QuizEditorHeader
          onCreateQuiz={() => {}}
          onBack={handleNavigateAway}
          canCreate={isValidForCreation}
          isCreating={false}
        />

        {/* Validation Status */}
        <div className="px-4">
          {!currentTitle.trim() && (
            <div className="text-red-500 text-sm">⚠️ Title is required</div>
          )}
          {!quiz.questions.length && (
            <div className="text-red-500 text-sm">
              ⚠️ At least one question is required
            </div>
          )}
          {quiz.questions.some(
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
          questions={quiz.questions}
          onAddQuestion={(question) => addQuestion(question)}
          onAddQuestionAfter={handleAddQuestionAfter}
          onUpdateQuestion={handleUpdateQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onMoveQuestionUp={handleMoveQuestionUp}
          onMoveQuestionDown={handleMoveQuestionDown}
        />
      </div>
    </ThinLayout>
  );
}
