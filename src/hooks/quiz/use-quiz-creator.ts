"use client";

import type { UseQuizCreatorReturn } from "./quiz-creator-types";
import { useFileProcessor } from "./use-file-processor";
import { useQuizGenerator } from "./use-quiz-generator";
import { useQuizSaver } from "./use-quiz-saver";

export function useQuizCreator(): UseQuizCreatorReturn {
  // Use specialized hooks
  const fileProcessor = useFileProcessor();
  const quizGenerator = useQuizGenerator(fileProcessor.uploadedFiles);
  const quizSaver = useQuizSaver(quizGenerator.currentQuiz);

  // Combined reset function
  const reset = () => {
    fileProcessor.reset();
    quizGenerator.reset();
    quizSaver.reset();
  };

  // Return composed functionality
  return {
    // File management
    uploadedFiles: fileProcessor.uploadedFiles,
    addFiles: fileProcessor.addFiles,
    removeFile: fileProcessor.removeFile,
    clearFiles: fileProcessor.clearFiles,
    isProcessingFiles: fileProcessor.isProcessingFiles,
    hasFiles: fileProcessor.hasFiles,

    // Quiz operations
    generateQuiz: quizGenerator.generateQuiz,
    extractQuiz: quizGenerator.extractQuiz,
    isGenerating: quizGenerator.isGenerating,
    currentQuiz: quizGenerator.currentQuiz,

    // Quiz saving
    saveQuiz: quizSaver.saveQuiz,
    isSaving: quizSaver.isSaving,

    // Combined state
    error: quizGenerator.error || quizSaver.error,

    // Utilities
    reset,
  };
}
