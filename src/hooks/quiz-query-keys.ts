export const quizQueryKeys = {
  // Question operations
  extractQuestions: (content: string, settings?: any) =>
    ["extractQuestions", hashContent(content), settings] as const,

  extractQuestionsAI: (content: string, settings?: any) =>
    ["extractQuestionsAI", hashContent(content), settings] as const,

  generateQuestions: (content: string, settings?: any) =>
    ["generateQuestions", hashContent(content), settings] as const,

  generateTitle: (content: string, questionCount: number, options?: any) =>
    ["generateTitle", hashContent(content), questionCount, options] as const,

  titleDescription: (content: string, questions: any[], options?: any) =>
    [
      "quiz-title-description",
      hashContent(content),
      questions.length,
      options,
    ] as const,

  // File operations
  fileProcessing: (fileId: string) => ["fileProcessing", fileId] as const,
  fileContent: (fileId: string) => ["fileContent", fileId] as const,

  // Quiz data
  quizData: () => ["quizData"] as const,
  uploadedFiles: () => ["uploadedFiles"] as const,
} as const;

// Helper function to create consistent content hash
function hashContent(content: string): string {
  if (!content) return "empty";
  return `${content.slice(0, 100)}-${content.length}`;
}
