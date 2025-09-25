"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  BackendQuestion,
  BackendQuizEntity,
  GeneratedQuiz,
  QuestionData,
  UseQuizLoaderReturn,
} from "./quiz-editor-types";

function convertBackendQuestion(backendQ: BackendQuestion): QuestionData {
  // Add safety checks for options
  const options = backendQ.options || [];

  return {
    id: backendQ.id,
    question: backendQ.text,
    type: backendQ.type,
    difficulty: "MEDIUM",
    points: backendQ.points || 1,
    explanation: backendQ.explanation,
    answers: options.map((option, index) => ({
      id: option.id,
      text: option.text,
      isCorrect: option.id === backendQ.correctAnswer,
      order_index: index + 1,
    })),
    tags: [],
  };
}

export function convertBackendQuiz(
  backendQuiz: BackendQuizEntity,
): GeneratedQuiz {
  const questions = backendQuiz.quizData?.questions || [];

  const convertTags = (tags: any[]): string[] => {
    if (!Array.isArray(tags)) return [];
    return tags.map((tag) => {
      if (typeof tag === "string") return tag;
      if (typeof tag === "object" && tag.name) return tag.name;
      return String(tag);
    });
  };

  return {
    title: backendQuiz.title,
    description: backendQuiz.description || "",
    questions: questions.map(convertBackendQuestion),
    settings: {
      visibility: backendQuiz.visibility,
      language: "AUTO",
      question_type: "MIXED",
      number_of_questions: backendQuiz.totalQuestions || questions.length,
      mode: "QUIZ",
      difficulty: backendQuiz.difficulty,
      task: "GENERATE_QUIZ",
      parsing_mode: "BALANCED",
      shuffle_questions: false,
      shuffle_answers: false,
      show_explanations: true,
      allow_retry: true,
      passing_score: backendQuiz.passingScore || 70,
      status: backendQuiz.status,
      isPremium: backendQuiz.isPremium,
      isFeatured: backendQuiz.isFeatured || false,
      isTrending: backendQuiz.isTrending || false,
      estimatedTime: backendQuiz.estimatedTime,
      maxAttempts: backendQuiz.maxAttempts,
      passingScore: backendQuiz.passingScore,
    },
    metadata: {
      total_questions: backendQuiz.totalQuestions || questions.length,
      total_points: backendQuiz.totalPoints || questions.length,
      estimated_time:
        backendQuiz.estimatedTime || Math.ceil(questions.length * 1.5),
      tags: convertTags(backendQuiz.tags || []),
    },
    savedQuizId: backendQuiz.id,
  };
}

export function useQuizLoader(quizId: string): UseQuizLoaderReturn {
  // Fetch quiz data
  const {
    data: backendQuiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BackendQuizEntity, Error>({
    queryKey: ["quiz", quizId],
    queryFn: async (): Promise<BackendQuizEntity> => {
      if (!quizId) {
        throw new Error("Quiz ID is required");
      }

      // Clear any existing progress when loading a quiz
      try {
        localStorage.removeItem(`quiz-progress-${quizId}`);
      } catch (error) {
        console.warn("Failed to clear quiz progress:", error);
      }

      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/quiz/${quizId}`, {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message ||
          `Failed to load quiz: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      let data: BackendQuizEntity;
      if (
        typeof result === "object" &&
        result !== null &&
        "success" in result
      ) {
        if (!result.success) {
          throw new Error(result.message || "Failed to load quiz");
        }
        data = result.data as BackendQuizEntity;
      } else {
        // Old structure, data is directly in result
        data = result as BackendQuizEntity;
      }

      if (!data || typeof data !== "object" || !data.id) {
        throw new Error("Invalid quiz data received from server");
      }
      if (!data.quizData) {
        data.quizData = { questions: [] };
      }

      // Ensure questions array exists
      if (!Array.isArray(data.quizData.questions)) {
        data.quizData.questions = [];
      }

      return data;
    },
    enabled: !!quizId && quizId !== "undefined",
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0,
    gcTime: 0,
  });

  const convertedQuiz = backendQuiz ? convertBackendQuiz(backendQuiz) : null;

  return {
    originalQuiz: convertedQuiz,
    isLoading,
    isError,
    error,
    refetch,
  };
}
