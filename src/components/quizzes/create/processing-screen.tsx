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
  showSuccessFor = 4000,
  autoNavigate = true,
}: ProcessingScreenProps) {
  const [showResult, setShowResult] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "processing" | "saving" | "complete"
  >("processing");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isDone) {
      setShowResult(false);
      setIsNavigating(false);
      setIsTransitioning(false);

      // Detect if we're in saving phase by checking the label
      if (label?.toLowerCase().includes("saving")) {
        setCurrentStep("saving");
      } else {
        setCurrentStep("processing");
      }
      return;
    }

    setShowResult(true);
    setCurrentStep("complete");

    if (!hasError && autoNavigate) {
      // Start navigation phase immediately
      setIsNavigating(true);
      setIsTransitioning(true);

      // Complete after longer delay to ensure navigation finishes
      const completeTimer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, showSuccessFor);

      return () => {
        clearTimeout(completeTimer);
      };
    }
  }, [isDone, hasError, onComplete, showSuccessFor, autoNavigate, label]);

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
    if (!isDone) {
      if (currentStep === "saving") {
        return "Saving your quiz";
      }
      return "Preparing your quiz";
    }
    if (hasError) return "Something went wrong";
    if (isNavigating) return "Opening quiz editor...";
    return "Quiz Ready!";
  };

  const getDescription = () => {
    if (!isDone) {
      if (currentStep === "saving") {
        return "Saving to database...";
      }
      return label || "Please wait a moment";
    }
    if (hasError) return "Please try again";
    if (isNavigating) return "Taking you to the quiz editor...";
    return "Your quiz has been created successfully!";
  };

  const getProgressWidth = () => {
    if (!isDone) {
      if (currentStep === "saving") {
        return "85%";
      }
      return "45%";
    }
    // When done, show near complete but not 100% until navigation starts
    if (isTransitioning) {
      return "100%";
    }
    return "95%";
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-sm p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div
            className={`rounded-full p-3 transition-all duration-300 ${
              hasError
                ? "bg-red-50"
                : isNavigating
                  ? "bg-blue-50"
                  : showResult
                    ? ""
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

        {!isDone && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: getProgressWidth() }}
            />
          </div>
        )}

        {isDone && !hasError && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-1500 ease-out ${
                isNavigating ? "bg-blue-600" : "bg-green-600"
              }`}
              style={{
                width: getProgressWidth(),
                transitionDelay: showResult ? "0ms" : "200ms",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
