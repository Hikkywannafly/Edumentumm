"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type {
  GeneratedQuiz,
  QuizCreatorSettings,
  UploadedFile,
  UseQuizGeneratorReturn,
} from "./quiz-creator-types";

export function useQuizGenerator(
  uploadedFiles: UploadedFile[],
): UseQuizGeneratorReturn {
  const queryClient = useQueryClient();
  const [currentQuiz, setCurrentQuiz] = useState<GeneratedQuiz | null>(null);

  // Quiz generation mutation
  const generateQuizMutation = useMutation({
    mutationFn: async (
      settings: QuizCreatorSettings,
    ): Promise<GeneratedQuiz> => {
      // Only send files that have been successfully parsed and have content
      const filesToSend = uploadedFiles
        .filter(
          (f) =>
            f.status === "success" && f.parsedContent && f.parsedContent.trim(),
        )
        .map((f) => ({
          id: f.id,
          name: f.name,
          parsedContent: f.parsedContent,
          status: f.status,
        }));

      if (filesToSend.length === 0) {
        throw new Error("No successfully processed files with content found");
      }

      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToSend,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      return response.json();
    },
    onSuccess: (quiz) => {
      setCurrentQuiz(quiz);
      queryClient.setQueryData(["quiz-temp", Date.now()], quiz);
    },
  });
  const extractQuizMutation = useMutation({
    mutationFn: async (
      settings: QuizCreatorSettings,
    ): Promise<GeneratedQuiz> => {
      // Only send files that have been successfully parsed and have content
      const filesToSend = uploadedFiles
        .filter(
          (f) =>
            f.status === "success" && f.parsedContent && f.parsedContent.trim(),
        )
        .map((f) => ({
          id: f.id,
          name: f.name,
          parsedContent: f.parsedContent,
          status: f.status,
        }));

      if (filesToSend.length === 0) {
        throw new Error("No successfully processed files with content found");
      }

      const response = await fetch("/api/quiz/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesToSend,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract quiz");
      }

      return response.json();
    },
    onSuccess: (quiz) => {
      setCurrentQuiz(quiz);
      // Cache the extracted quiz
      queryClient.setQueryData(["quiz-temp", Date.now()], quiz);
    },
  });

  const generateQuiz = async (settings: QuizCreatorSettings) => {
    return generateQuizMutation.mutateAsync(settings);
  };

  const extractQuiz = async (settings: QuizCreatorSettings) => {
    return extractQuizMutation.mutateAsync(settings);
  };

  const reset = () => {
    setCurrentQuiz(null);
    generateQuizMutation.reset();
    extractQuizMutation.reset();
  };

  return {
    generateQuiz,
    extractQuiz,
    isGenerating:
      generateQuizMutation.isPending || extractQuizMutation.isPending,
    currentQuiz,
    error: generateQuizMutation.error || extractQuizMutation.error,
    reset,
  };
}
