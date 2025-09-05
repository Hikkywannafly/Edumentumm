"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GeneratedQuiz, UseQuizSaverReturn } from "./quiz-editor-types";

export function useQuizSaverEditor(
  quizId: string,
  quiz: GeneratedQuiz | null,
  changedFields: Partial<GeneratedQuiz> = {},
): UseQuizSaverReturn {
  const queryClient = useQueryClient();

  // Save quiz mutation
  const saveMutation = useMutation({
    mutationFn: async (): Promise<any> => {
      if (!quiz) throw new Error("No quiz to save");

      if (Object.keys(changedFields).length === 0) {
        throw new Error("No changes to save");
      }

      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const payload: any = {};

      if (changedFields.title !== undefined) {
        payload.title = changedFields.title;
      }

      if (changedFields.description !== undefined) {
        payload.description = changedFields.description;
      }

      if (changedFields.questions !== undefined) {
        payload.questions = changedFields.questions;
      }

      if (changedFields.metadata !== undefined) {
        payload.metadata = changedFields.metadata;
      }

      console.log("Saving only changed fields:", payload);

      const response = await fetch(`/api/quiz/${quizId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error("Error saving quiz");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["quiz", quizId], quiz);
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });

  const saveQuiz = async () => {
    await saveMutation.mutateAsync();
  };

  return {
    saveQuiz,
    isSaving: saveMutation.isPending,
    error: saveMutation.error,
  };
}
