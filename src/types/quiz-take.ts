import type { BackendQuestion, BackendQuizEntity } from "@/types/quiz";

export type QuizTakeMode = "QUIZ" | "EXAM";

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  timeSpent: number; // in seconds
}

export interface QuizAttempt {
  quizId: number;
  startTime: string;
  answers: QuizAnswer[];
  currentQuestionIndex: number;
  isCompleted: boolean;
  totalTimeSpent: number;
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
    question: BackendQuestion;
  }>;
}

export interface QuizTakeProps {
  quiz: BackendQuizEntity;
  mode?: QuizTakeMode;
}

export interface QuizQuestionProps {
  question: BackendQuestion;
  selectedOptionId?: string;
  onAnswerChange: (optionId: string) => void;
  showResult?: boolean;
  correctOptionId?: string;
  mode?: QuizTakeMode;
  isAnswered?: boolean;
}

export interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  onNavigateToQuestion: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isCompleted: boolean;
  mode?: QuizTakeMode;
  showFeedback?: boolean;
  currentQuestionResult?: {
    isCorrect: boolean;
    correctAnswer: string;
    explanation?: string;
  } | null;
  onRetry?: () => void;
  questions?: any[]; // Add questions prop to access question data
}

export interface QuizHeaderProps {
  title: string;
  currentQuestion: number;
  totalQuestions: number;
  timeSpent: number;
  estimatedTime?: number;
}

export interface QuizResultProps {
  result: QuizResult;
  quiz: BackendQuizEntity;
  onRetake: () => void;
  onBackToQuizzes: () => void;
}
