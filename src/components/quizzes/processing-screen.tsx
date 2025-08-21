"use client";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessingScreenProps {
  fileName: string;
  label?: string;
  isDone?: boolean;
  hasError?: boolean;
  onComplete?: () => void;
}

export function ProcessingScreen({
  fileName,
  label,
  isDone = false,
  hasError = false,
  onComplete,
}: ProcessingScreenProps) {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isDone) {
      setShowResult(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowResult(true);

      if (onComplete) {
        setTimeout(onComplete, 1500);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isDone, onComplete]);

  const getIcon = () => {
    if (!isDone) {
      return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
    }
    if (hasError) {
      return <AlertCircle className="h-8 w-8 text-red-600" />;
    }
    return <CheckCircle className="h-8 w-8 text-green-600" />;
  };

  const getTitle = () => {
    if (!isDone) return "Preparing your quiz";
    if (hasError) return "Something went wrong";
    return "Quiz Ready!";
  };

  const getDescription = () => {
    if (!isDone) return label || "Please wait a moment";
    if (hasError) return "Please try again";
    return "Your quiz has been created successfully";
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-background/80 ">
      <div className="w-full max-w-sm bg-card p-8 text-center ">
        <div className="mb-6 flex justify-center">
          <div
            className={`rounded-full p-3 ${
              hasError ? "bg-red-50" : showResult ? "bg-green-50" : ""
            }`}
          >
            {getIcon()}
          </div>
        </div>

        <h3 className="mb-3 font-semibold text-lg">{getTitle()}</h3>

        <p className="mb-4 text-muted-foreground text-sm">{getDescription()}</p>

        <p className="truncate text-muted-foreground text-xs">{fileName}</p>

        {/* Progress indicator for loading state */}
        {!isDone && (
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-full animate-pulse bg-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
