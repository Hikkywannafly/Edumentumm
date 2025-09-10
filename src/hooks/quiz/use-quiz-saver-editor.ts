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
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error saving quiz";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Handle the new API response structure
      if (result.success !== undefined) {
        // New structure with success/message/data wrapper
        if (!result.success) {
          const errorMessage = result.message || "Failed to save quiz";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.success(result.message || "Quiz saved successfully");
        return result.data;
      }

      // Old structure
      toast.success("Quiz saved successfully");
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["quiz", quizId], data);
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
