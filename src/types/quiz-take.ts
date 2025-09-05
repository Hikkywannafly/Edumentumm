import type { BackendQuestion, BackendQuizEntity } from "@/types/quiz";

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
}

export interface QuizQuestionProps {
  question: BackendQuestion;
  selectedOptionId?: string;
  onAnswerChange: (optionId: string) => void;
  showResult?: boolean;
  correctOptionId?: string;
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
