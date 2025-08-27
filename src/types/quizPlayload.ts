import type {
  Difficulty,
  FileProcessingMode,
  GenerationMode,
  Language,
  ParsingMode,
  QuestionType,
  QuizMode,
  SourceType,
  Visibility,
} from "./quiz";
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

export interface BackendQuizEntity {
  id?: number;
  title: string;
  description?: string;
  userId?: number;
  categoryId?: number;
  visibility: Visibility;
  language: Language;
  questionType: QuestionType | "MIXED";
  numberOfQuestions: number;
  mode: QuizMode;
  difficulty: Difficulty;
  task: string;
  parsingMode: ParsingMode;
  sourceType?: SourceType;
  sourceContent?: string;
  isAiGenerated: boolean;
  aiModel?: string;
  generationMode?: GenerationMode;
  fileProcessingMode?: FileProcessingMode;
  quizData: Map<string, any>; // JSONB field
  tags?: string[];
  estimatedTime?: number;
  passingScore: number;
  totalQuestions?: number;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
}
