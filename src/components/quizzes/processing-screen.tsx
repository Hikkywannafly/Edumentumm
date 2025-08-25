"use client";

import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessingScreenProps {
  fileName: string;
  label?: string;
  isDone?: boolean;
  hasError?: boolean;
  onComplete?: () => void;
  showSuccessFor?: number;
  autoNavigate?: boolean;
}

export function ProcessingScreen({
  fileName,
  label,
  isDone = false,
  hasError = false,
  onComplete,
  showSuccessFor = 2500,
  autoNavigate = true,
}: ProcessingScreenProps) {
  const [showResult, setShowResult] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (!isDone) {
      setShowResult(false);
      setIsNavigating(false);
      return;
    }

    // Show result immediately
    setShowResult(true);

    if (!hasError && autoNavigate) {
      // Show navigation state after showing success
      const navigateTimer = setTimeout(() => {
        setIsNavigating(true);
      }, 1500);

      // Call onComplete after showing navigation state
      const completeTimer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, showSuccessFor);

      return () => {
        clearTimeout(navigateTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isDone, hasError, onComplete, showSuccessFor, autoNavigate]);

  const getIcon = () => {
    if (!isDone) {
      return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
    }
    if (hasError) {
      return <AlertCircle className="h-8 w-8 text-red-600" />;
    }
    if (isNavigating) {
      return <ArrowRight className="h-8 w-8 animate-pulse text-blue-600" />;
    }
    return <CheckCircle className="h-8 w-8 text-green-600" />;
  };

  const getTitle = () => {
    if (!isDone) return "Preparing your quiz";
    if (hasError) return "Something went wrong";
    if (isNavigating) return "Redirecting...";
    return "Quiz Ready!";
  };

  const getDescription = () => {
    if (!isDone) return label || "Please wait a moment";
    if (hasError) return "Please try again";
    if (isNavigating) return "Taking you to the quiz editor...";
    return "Your quiz has been created successfully";
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg bg-card p-8 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <div
            className={`rounded-full p-3 transition-all duration-300 ${
              hasError
                ? "bg-red-50"
                : isNavigating
                  ? "bg-blue-50"
                  : showResult
                    ? "bg-green-50"
                    : "bg-blue-50"
            }`}
          >
            {getIcon()}
          </div>
        </div>

        <h3 className="mb-3 font-semibold text-lg transition-all duration-300">
          {getTitle()}
        </h3>

        <p className="mb-4 text-muted-foreground text-sm transition-all duration-300">
          {getDescription()}
        </p>

        <p className="truncate text-muted-foreground text-xs">{fileName}</p>

        {/* Progress indicator for loading state */}
        {!isDone && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full animate-pulse bg-blue-600" />
          </div>
        )}

        {/* Success progress bar */}
        {isDone && !hasError && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-1000 ease-out ${
                isNavigating ? "bg-blue-600" : "bg-green-600"
              }`}
              style={{
                width: isNavigating ? "100%" : "70%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
