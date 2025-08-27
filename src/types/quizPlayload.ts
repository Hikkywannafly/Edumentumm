import type { Difficulty, QuestionType, SourceType, Visibility } from "./quiz";
export interface BackendTag {
  id?: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface QuizPayload {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  difficulty: Difficulty;
  estimatedTime: number;
  passingScore: number;
  maxAttempts?: number;
  isAiGenerated: boolean;
  aiModel?: string;
  sourceType: SourceType;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  keywords?: string[];
  visibility: Visibility;
  isPremium?: boolean;
  quizData: {
    introduction?: string;
    instructions?: string;
    questions: Array<{
      id: string | number;
      text: string;
      type: QuestionType;
      points: number;
      options: Array<{
        id: string;
        text: string;
      }>;
      correctAnswer: string;
      explanation?: string;
    }>;
    summary?: string;
  };
  tags: BackendTag[];
}

export interface BackendQuizResponse {
  id: number;
  title: string;
  slug: string;
  description?: string;
  user: {
    userId: number;
    username: string;
    email: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
}
