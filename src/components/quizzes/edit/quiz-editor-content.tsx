"use client";

import ThinLayout from "@/components/layout/thin-layout";
import { useCreateQuiz } from "@/hooks/quiz";
import { useQuizEditorSync } from "@/hooks/use-quiz-editor-sync";
import { useQuizEditorStore } from "@/stores/quiz-editor-store";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QuizDescriptionEditor } from "./quiz-description-editor";
import { QuizEditorHeader } from "./quiz-editor-header";
import { QuizQuestionsEditor } from "./quiz-questions-editor";
import { QuizTagsCategoriesEditor } from "./quiz-tags-categories-editor";
import { QuizTitleEditor } from "./quiz-title-editor";

export function QuizEditorContent() {
  const router = useRouter();
  const [isValidForCreation, setIsValidForCreation] = useState(false);

  const {
    quizData,
    addQuestion,
    addQuestionAfter,
    updateQuestion,
    deleteQuestion,
    moveQuestion,
    updateQuizData,
  } = useQuizEditorStore();

  const { title, description, updateTitle, updateDescription } =
    useQuizEditorSync();

  // React Query mutation for creating quiz
  const createQuizMutation = useCreateQuiz({
    onSuccess: (data) => {
      alert(`Quiz created successfully! Quiz ID: ${data.id}`);
      // // Redirect to quiz list or view page
      // router.push(`/quizzes/${data.id}`);
    },
    onError: (error) => {
      alert(`Error creating quiz: ${error.message}`);
    },
    redirectToEdit: false, // We handle redirect manually
  });

  const currentTitle = title || quizData?.title || "";
  const currentDescription = description || quizData?.description || "";

  // Validate quiz data for creation
  const validateQuizForCreation = useCallback(() => {
    if (!currentTitle.trim()) return false;
    if (!quizData?.questions?.length) return false;

    // Check if all questions have at least one correct answer
    const hasValidQuestions = quizData.questions.every((question) => {
      if (
        question.type === "MULTIPLE_CHOICE" ||
        question.type === "TRUE_FALSE"
      ) {
        return question.answers.some((answer) => answer.isCorrect);
      }
      return true; // For other question types
    });

    return hasValidQuestions;
  }, [currentTitle, quizData]);

  // Update validation state when data changes
  useEffect(() => {
    setIsValidForCreation(validateQuizForCreation());
  }, [validateQuizForCreation]);

  // Handle create quiz
  const handleCreateQuiz = async () => {
    if (!quizData || !validateQuizForCreation()) {
      alert(
        "Please complete all required fields and ensure each question has at least one correct answer.",
      );
      return;
    }

    // Prepare quiz data for API - using camelCase as expected by backend validation
    const quizPayload = {
      title: currentTitle.trim(),
      description: currentDescription?.trim() || "",
      categoryId: 1, // Default category, should be dynamic
      quizData: {
        questions: quizData.questions.map((question, index) => ({
          id: question.id,
          question: question.question,
          type: question.type,
          difficulty: question.difficulty || "MEDIUM",
          bloom_level: "UNDERSTAND",
          points: question.points || 1,
          explanation: question.explanation,
          tags: question.tags || [],
          answers: question.answers,
          order_index: index + 1,
        })),
        settings: {
          visibility: "PRIVATE",
          language: "AUTO",
          question_type: "MIXED",
          number_of_questions: quizData.questions.length,
          mode: "QUIZ",
          difficulty: "EASY",
          task: "GENERATE_QUIZ",
          parsing_mode: "BALANCED", // matches parsingMode field
          shuffle_questions: false,
          shuffle_answers: false,
          show_explanations: true,
          allow_retry: true,
          time_limit_per_question: null,
          passing_score: 70, // matches passingScore field
        },
        source_info: {
          type: "TEXT", // matches sourceType field
          content: "Created manually in quiz editor", // matches sourceContent field
        },
        ai_info: {
          is_ai_generated: false, // matches isAiGenerated field
          model: undefined, // matches aiModel field (using 'model' from AIInfo interface)
          prompt: undefined,
          generation_settings: undefined,
          processing_time: undefined,
        },
        metadata: {
          total_questions: quizData.questions.length,
          total_points: quizData.questions.reduce(
            (sum, q) => sum + (q.points || 1),
            0,
          ),
          estimated_time: Math.ceil(quizData.questions.length * 1.5), // matches estimatedTime field
          tags: quizData.metadata?.tags || [], // matches tags field (will be converted to String[])
          category: quizData.metadata?.category,
        },
      },
    };

    try {
      await createQuizMutation.mutateAsync(quizPayload as any);
    } catch (error) {
      console.error("Failed to create quiz:", error);
    }
  };

  // Handle navigation back
  const handleNavigateAway = () => {
    const confirmed = window.confirm(
      "Are you sure you want to leave? Your quiz data will be lost.",
    );
    if (confirmed) {
      router.back();
    }
  };

  if (!quizData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">
          No quiz data found. Please go back and upload files first.
        </div>
      </div>
    );
  }

  const handleUpdateQuestion = (updatedQuestion: any) => {
    updateQuestion(updatedQuestion.id, updatedQuestion);
    setIsValidForCreation(validateQuizForCreation());
  };

  const handleMoveQuestionUp = (id: string) => {
    const index = quizData.questions.findIndex((q) => q.id === id);
    if (index > 0) {
      moveQuestion(index, index - 1);
    }
  };

  const handleMoveQuestionDown = (id: string) => {
    const index = quizData.questions.findIndex((q) => q.id === id);
    if (index < quizData.questions.length - 1) {
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

    addQuestionAfter(afterIndex, newQuestion);
    setIsValidForCreation(validateQuizForCreation());
  };

  const handleDeleteQuestion = (id: string) => {
    deleteQuestion(id);
    setIsValidForCreation(validateQuizForCreation());
  };

  const handleCategoryChange = (category: string) => {
    if (quizData) {
      const currentMetadata = quizData.metadata || {
        total_questions: quizData.questions.length,
        total_points: quizData.questions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.ceil(quizData.questions.length * 1.5),
        tags: [],
      };

      updateQuizData({
        metadata: {
          ...currentMetadata,
          category,
        },
      });
    }
  };

  const handleTagsChange = (tags: string[]) => {
    if (quizData) {
      const currentMetadata = quizData.metadata || {
        total_questions: quizData.questions.length,
        total_points: quizData.questions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        estimated_time: Math.ceil(quizData.questions.length * 1.5),
        tags: [],
      };
      updateQuizData({
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
          onCreateQuiz={handleCreateQuiz}
          onBack={handleNavigateAway}
          canCreate={isValidForCreation && !createQuizMutation.isPending}
          isCreating={createQuizMutation.isPending}
        />

        {/* Validation Status */}
        <div className="px-4">
          {!currentTitle.trim() && (
            <div className="text-red-500 text-sm">⚠️ Title is required</div>
          )}
          {!quizData.questions.length && (
            <div className="text-red-500 text-sm">
              ⚠️ At least one question is required
            </div>
          )}
          {quizData.questions.some(
            (q) =>
              (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") &&
              !q.answers.some((a) => a.isCorrect),
          ) && (
            <div className="text-red-500 text-sm">
              ⚠️ Each question must have at least one correct answer
            </div>
          )}
        </div>

        <QuizTitleEditor title={currentTitle} onTitleChange={updateTitle} />
        <QuizDescriptionEditor
          description={currentDescription}
          onDescriptionChange={updateDescription}
        />
        <QuizTagsCategoriesEditor
          category={quizData.metadata?.category || ""}
          onCategoryChange={handleCategoryChange}
          tags={quizData.metadata?.tags || []}
          onTagsChange={handleTagsChange}
        />
        <QuizQuestionsEditor
          questions={quizData.questions}
          onAddQuestion={addQuestion}
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
