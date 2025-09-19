"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateCacheWithQuizData } from "./use-quiz-saver-editor";

export function useQuizSettingsSaver(quizId: string) {
  const queryClient = useQueryClient();

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any): Promise<any> => {
      const accessToken = localStorage.getItem("accessToken");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      // Create payload with only settings fields
      const payload: any = {
        visibility: settings.visibility,
        status: settings.status,
        isPremium: settings.isPremium,
        isFeatured: settings.isFeatured,
        isTrending: settings.isTrending,
        estimatedTime: settings.estimatedTime,
        passingScore: settings.passingScore,
        maxAttempts: settings.maxAttempts,
      };

      // Also update metadata if it exists
      if (settings.metadata) {
        payload.metadata = settings.metadata;
      }

      console.log("Saving settings:", JSON.stringify(payload));

      const response = await fetch(`/api/quiz/${quizId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Error saving quiz settings";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (result.success !== undefined) {
        if (!result.success) {
          const errorMessage = result.message || "Failed to save quiz settings";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.success(result.message || "Quiz settings saved successfully");
        return result.data;
      }

      toast.success("Quiz settings saved successfully");
      return result;
    },
    onSuccess: (data) => {
      updateCacheWithQuizData(queryClient, quizId, data);
    },
  });

  const saveSettings = async (settings: any) => {
    await saveSettingsMutation.mutateAsync(settings);
  };

  return {
    saveSettings,
    isSaving: saveSettingsMutation.isPending,
    error: saveSettingsMutation.error,
  };
}
