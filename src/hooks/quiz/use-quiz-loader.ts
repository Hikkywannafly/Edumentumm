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

function convertBackendQuiz(backendQuiz: BackendQuizEntity): GeneratedQuiz {
  const questions = backendQuiz.quizData?.questions || [];

  const convertTags = (tags: any[]): string[] => {
    if (!Array.isArray(tags)) return [];
    const converted = tags.map((tag) => {
      if (typeof tag === "string") return tag;
      if (typeof tag === "object" && tag.name) return tag.name;
      return String(tag);
    });
    return converted;
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
  } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: async (): Promise<BackendQuizEntity> => {
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
        throw new Error(`Failed to load quiz: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.id) {
        throw new Error("Invalid quiz data received from server");
      }

      if (!data.quizData) {
        console.warn("Quiz data missing quizData field", data);
        // Create a minimal structure if missing
        data.quizData = { questions: [] };
      }

      if (!data.quizData.questions) {
        console.warn("Quiz data missing questions array", data.quizData);
        data.quizData.questions = [];
      }
      return data as BackendQuizEntity;
    },
    enabled: !!quizId,
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache data for too long
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
