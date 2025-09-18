"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

interface QuizNavigationContextType {
  isQuizInProgress: boolean;
  quizHasAnswers: boolean;
  setIsQuizInProgress: (inProgress: boolean) => void;
  setQuizHasAnswers: (hasAnswers: boolean) => void;
  showNavigationWarning: () => boolean;
}

const QuizNavigationContext = createContext<
  QuizNavigationContextType | undefined
>(undefined);

export function QuizNavigationProvider({ children }: { children: ReactNode }) {
  const [isQuizInProgress, setIsQuizInProgress] = useState(false);
  const [quizHasAnswers, setQuizHasAnswers] = useState(false);

  const showNavigationWarning = useCallback(() => {
    // Only show warning if quiz is in progress and has answers
    return isQuizInProgress && quizHasAnswers;
  }, [isQuizInProgress, quizHasAnswers]);

  return (
    <QuizNavigationContext.Provider
      value={{
        isQuizInProgress,
        quizHasAnswers,
        setIsQuizInProgress,
        setQuizHasAnswers,
        showNavigationWarning,
      }}
    >
      {children}
    </QuizNavigationContext.Provider>
  );
}

export function useQuizNavigationContext() {
  const context = useContext(QuizNavigationContext);
  if (context === undefined) {
    throw new Error(
      "useQuizNavigationContext must be used within a QuizNavigationProvider",
    );
  }
  return context;
}
