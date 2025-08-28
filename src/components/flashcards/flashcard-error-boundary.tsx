"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { flashcardQueryKeys } from "@/hooks/flashcard-query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FallbackProps } from "react-error-boundary";

export function FlashcardErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const t = useTranslations("Flashcards");
  const queryClient = useQueryClient();

  const handleRetry = () => {
    // Clear all flashcard queries from cache
    queryClient.invalidateQueries({ queryKey: flashcardQueryKeys.all });
    resetErrorBoundary();
  };

  const handleRefreshAll = () => {
    // Force refresh all flashcard data
    queryClient.refetchQueries({ queryKey: flashcardQueryKeys.all });
    resetErrorBoundary();
  };

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            {/* Error Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-lg">
                {t("error.title", { defaultValue: "Something went wrong" })}
              </h3>
              <p className="text-gray-600 text-sm">
                {error.message ||
                  t("error.description", {
                    defaultValue:
                      "Unable to load flashcards. Please try again.",
                  })}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={handleRetry} className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("error.retry", { defaultValue: "Try Again" })}
              </Button>
              <Button
                onClick={handleRefreshAll}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {t("error.refresh", { defaultValue: "Refresh All" })}
              </Button>
            </div>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer font-medium text-gray-700 text-sm">
                  Debug Information
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-gray-600 text-xs">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
