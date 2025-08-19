"use client";

import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProcessingScreenProps {
  fileName: string;
  label?: string;
  isDone?: boolean;
}

export function ProcessingScreen({
  fileName,
  label,
  isDone,
}: ProcessingScreenProps) {
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!isDone) {
      setShowComplete(false);
      return;
    }
    const t = setTimeout(() => setShowComplete(true), 500);
    return () => clearTimeout(t);
  }, [isDone]);

  return (
    <div className="w-full max-w-sm rounded-lg p-6 text-center ">
      <div className="mb-4 flex justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full ">
          {showComplete ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          )}
        </div>
      </div>
      <h3 className="mb-2 font-semibold text-gray-900 text-lg">
        {showComplete ? "Flashcards Ready!" : "Preparing your flashcards"}
      </h3>
      <p className="mb-3 text-gray-600 text-sm">
        {showComplete
          ? "Your flashcards have been created"
          : label || "Please wait a moment"}
      </p>
      <p className="truncate text-gray-400 text-xs">{fileName}</p>
    </div>
  );
}
