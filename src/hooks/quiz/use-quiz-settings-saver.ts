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
        // Return the data part of the response which contains the updated quiz data
        return result.data || payload;
      }

      toast.success("Quiz settings saved successfully");
      // If no specific result structure, return the payload we sent
      console.log("Returning payload:", payload);
      return result || payload;
    },
    onSuccess: async (data) => {
      console.log("Settings save successful, data:", data);
      // After saving settings, fetch the updated quiz data to ensure cache is consistent
      try {
        const accessToken = localStorage.getItem("accessToken");
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(`/api/quiz/${quizId}`, {
          method: "GET",
          headers,
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Fetched updated quiz data:", result);
          if (result.success && result.data) {
            updateCacheWithQuizData(queryClient, quizId, result.data);
          } else {
            // Fallback to the data we got from the save operation
            updateCacheWithQuizData(queryClient, quizId, data);
          }
        } else {
          console.log("Failed to fetch updated quiz data, using save result");
          // Fallback to the data we got from the save operation
          updateCacheWithQuizData(queryClient, quizId, data);
        }
      } catch (error) {
        console.error("Failed to fetch updated quiz data:", error);
        // Fallback to the data we got from the save operation
        updateCacheWithQuizData(queryClient, quizId, data);
      }
    },
  });

  const saveSettings = async (settings: any) => {
    return await saveSettingsMutation.mutateAsync(settings);
  };

  return {
    saveSettings,
    isSaving: saveSettingsMutation.isPending,
    error: saveSettingsMutation.error,
  };
}
