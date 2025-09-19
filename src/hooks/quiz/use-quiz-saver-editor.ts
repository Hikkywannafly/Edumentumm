"use client";

import type { Tag } from "@/types/quiz";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GeneratedQuiz, UseQuizSaverReturn } from "./quiz-editor-types";
import { convertBackendQuiz } from "./use-quiz-loader";

export function useQuizSaverEditor(
  quizId: string,
  quiz: GeneratedQuiz | null,
  changedFields: Partial<GeneratedQuiz> = {},
): UseQuizSaverReturn {
  const queryClient = useQueryClient();

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

      // Handle metadata and keywords
      if (changedFields.metadata !== undefined) {
        payload.metadata = changedFields.metadata;
        if (changedFields.metadata?.tags) {
          payload.keywords = (changedFields.metadata.tags as Tag[]).map(
            (tag) => (typeof tag === "string" ? tag : tag.name),
          );
        }

        if (changedFields.metadata?.estimated_time !== undefined) {
          payload.estimatedTime = changedFields.metadata.estimated_time;
        }
      }

      handleSettingsFields(payload, changedFields);

      console.log("Saving only changed fields:", JSON.stringify(payload));

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

      if (result.success !== undefined) {
        if (!result.success) {
          const errorMessage = result.message || "Failed to save quiz";
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
        toast.success(result.message || "Quiz saved successfully");
        return result.data;
      }

      toast.success("Quiz saved successfully");
      return result;
    },
    onSuccess: (data) => {
      updateCacheWithQuizData(queryClient, quizId, data);
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

function handleSettingsFields(
  payload: any,
  changedFields: Partial<GeneratedQuiz>,
) {
  // Handle settings object fields
  if (changedFields.settings) {
    const settings = changedFields.settings;
    if (settings.visibility !== undefined) {
      payload.visibility = settings.visibility;
    }
    if (settings.status !== undefined) {
      payload.status = settings.status;
    }
    if (settings.isPremium !== undefined) {
      payload.isPremium = settings.isPremium;
    }
    if (settings.isFeatured !== undefined) {
      payload.isFeatured = settings.isFeatured;
    }
    if (settings.isTrending !== undefined) {
      payload.isTrending = settings.isTrending;
    }
    if (settings.estimatedTime !== undefined) {
      payload.estimatedTime = settings.estimatedTime;
    }
    if (settings.passingScore !== undefined) {
      payload.passingScore = settings.passingScore;
    }
    if (settings.maxAttempts !== undefined) {
      payload.maxAttempts = settings.maxAttempts;
    }
  }

  const topLevelSettings = changedFields as any;
  if (topLevelSettings.visibility !== undefined) {
    payload.visibility = topLevelSettings.visibility;
  }
  if (topLevelSettings.status !== undefined) {
    payload.status = topLevelSettings.status;
  }
  if (topLevelSettings.isPremium !== undefined) {
    payload.isPremium = topLevelSettings.isPremium;
  }
  if (topLevelSettings.isFeatured !== undefined) {
    payload.isFeatured = topLevelSettings.isFeatured;
  }
  if (topLevelSettings.isTrending !== undefined) {
    payload.isTrending = topLevelSettings.isTrending;
  }
  if (topLevelSettings.estimatedTime !== undefined) {
    payload.estimatedTime = topLevelSettings.estimatedTime;
  }
  if (topLevelSettings.passingScore !== undefined) {
    payload.passingScore = topLevelSettings.passingScore;
  }
  if (topLevelSettings.maxAttempts !== undefined) {
    payload.maxAttempts = topLevelSettings.maxAttempts;
  }
}

export function updateCacheWithQuizData(
  queryClient: any,
  quizId: string,
  data: any,
) {
  console.log("Updating cache with data:", data);
  const currentQuiz = queryClient.getQueryData(["quiz-editing", quizId]) as
    | GeneratedQuiz
    | undefined;

  let updatedQuizData: GeneratedQuiz | null = null;

  if (data) {
    if (data.id && data.title) {
      updatedQuizData = convertBackendQuiz(data);
      console.log("Converted backend quiz data:", updatedQuizData);
    } else if (currentQuiz) {
      // For partial updates (like settings), properly merge the data
      updatedQuizData = {
        ...currentQuiz,
        ...data,
        settings: {
          ...currentQuiz.settings,
          // Handle top-level settings fields that come from the backend response
          visibility: data.visibility ?? currentQuiz.settings?.visibility,
          status: data.status ?? currentQuiz.settings?.status,
          isPremium: data.isPremium ?? currentQuiz.settings?.isPremium,
          isFeatured: data.isFeatured ?? currentQuiz.settings?.isFeatured,
          isTrending: data.isTrending ?? currentQuiz.settings?.isTrending,
          estimatedTime:
            data.estimatedTime ?? currentQuiz.settings?.estimatedTime,
          passingScore: data.passingScore ?? currentQuiz.settings?.passingScore,
          maxAttempts: data.maxAttempts ?? currentQuiz.settings?.maxAttempts,
        },
        metadata: data.metadata
          ? {
              ...currentQuiz.metadata,
              ...data.metadata,
            }
          : currentQuiz.metadata,
      };
      console.log("Merged partial update data:", updatedQuizData);
    }
  } else if (currentQuiz) {
    updatedQuizData = currentQuiz;
  }

  if (updatedQuizData) {
    console.log("Setting updated quiz data in cache:", updatedQuizData);
    queryClient.setQueryData(["quiz", quizId], updatedQuizData);
    queryClient.setQueryData(["quiz-editing", quizId], updatedQuizData);
    console.log("Cache updated for both query keys");
  }

  queryClient.invalidateQueries({ queryKey: ["quizzes"] });
}
