// ===== ENUMS & TYPES =====
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "FREE_RESPONSE";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type BloomLevel =
  | "REMEMBER"
  | "UNDERSTAND"
  | "APPLY"
  | "ANALYZE"
  | "EVALUATE"
  | "CREATE";

export type Visibility = "PRIVATE" | "PUBLIC" | "UNLISTED";

export type Language = "AUTO" | "EN" | "VI" | "ZH" | "JA" | "KO";

export type QuizMode = "QUIZ" | "FLASHCARD" | "STUDY_GUIDE";

export type Task = "GENERATE_QUIZ" | "REVIEW" | "TEST";

export type ParsingMode = "FAST" | "BALANCED" | "THOROUGH";

export type SourceType =
  | "FILE"
  | "TEXT"
  | "AI_GENERATED"
  | "LINK"
  | "DRIVE"
  | "MATERIAL"
  | "MEDIA"
  | "IMAGE"
  | "YOUTUBE";

export type AIModel = "GPT-4" | "CLAUDE-3" | "GEMINI" | "LOCAL";

export type GenerationMode = "GENERATE" | "EXTRACT";

export type FileProcessingMode = "PARSE_THEN_SEND" | "SEND_DIRECT";

export type QuizCreationType =
  | "FILE_UPLOAD"
  | "AI_GENERATED"
  | "MANUAL"
  | "TEMPLATE";

export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ===== ENUM CONSTANTS (optional, for better IntelliSense) =====
export const VISIBILITY = {
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
  UNLISTED: "UNLISTED",
} as const;

export const DIFFICULTY = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
  FILL_BLANK: "FILL_BLANK",
  FREE_RESPONSE: "FREE_RESPONSE",
} as const;

export const QUIZ_MODE = {
  QUIZ: "QUIZ",
  FLASHCARD: "FLASHCARD",
  STUDY_GUIDE: "STUDY_GUIDE",
} as const;

// ===== CORE INTERFACES =====
export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  order_index: number;
  explanation?: string;
}

export interface Question {
  id: string;
  question: string;
  type: QuestionType;
  difficulty: Difficulty;
  bloom_level: BloomLevel;
  points: number;
  order_index: number;
  explanation?: string;
  answers: Answer[];
  shortAnswerText?: string;
  tags?: string[];
  image_url?: string;
}

// ===== QUIZ SETTINGS =====
export interface QuizSettings {
  visibility: Visibility;
  language: Language;
  question_type: QuestionType | "MIXED";
  number_of_questions: number;
  mode: QuizMode;
  difficulty: Difficulty;
  task: Task;
  parsing_mode: ParsingMode;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_explanations: boolean;
  allow_retry: boolean;
  time_limit_per_question?: number | null; // seconds
  passing_score: number; // percentage
  // New properties for quiz generation flow
  generationMode?: GenerationMode;
  fileProcessingMode?: FileProcessingMode;
  useAI?: boolean;
  autoSave?: boolean;
}

// ===== SOURCE INFORMATION =====
export interface SourceInfo {
  type: SourceType;
  content: string;
  file_references?: string[];
  metadata?: {
    title?: string;
    author?: string;
    date?: string;
    size?: number;
  };
}

// ===== AI INFORMATION =====
export interface AIInfo {
  is_ai_generated: boolean;
  model?: AIModel;
  prompt?: string;
  generation_settings?: {
    mode?: GenerationMode;
    processing_mode?: FileProcessingMode;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    difficulty?: Difficulty;
    question_type?: QuestionType | "MIXED";
  };
  processing_time?: number;
}

// ===== QUIZ METADATA =====
export interface QuizMetadata {
  total_questions: number;
  total_points: number;
  estimated_time: number; // minutes
  tags: string[];
  category?: string;
  subject?: string;
  grade_level?: string;
}

// ===== QUIZ DATA (JSONB) =====
export interface QuizData {
  questions: Question[];
  settings: QuizSettings;
  source_info: SourceInfo;
  ai_info: AIInfo;
  metadata: QuizMetadata;
}

// ===== DATABASE ENTITY =====
export interface QuizEntity {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  category_id?: number;
  quiz_data: QuizData;
  created_at: string;
  updated_at: string;
}

// ===== API PAYLOAD INTERFACES (for database) =====
export interface QuizPayloadOption {
  id: string | number;
  text: string;
  isCorrect: boolean;
}

export interface QuizPayloadQuestion {
  id: string | number;
  text: string; // Different from internal 'question' field
  type: QuestionType;
  difficulty?: Difficulty;
  points?: number;
  explanation?: string;
  tags?: string[];
  options: QuizPayloadOption[]; // Different from internal 'answers' field
}

export interface QuizPayloadSettings {
  randomizeQuestions?: boolean;
  showExplanations?: boolean;
  timeLimit?: number | null;
  passingScore?: number;
}

export interface QuizPayloadData {
  questions: QuizPayloadQuestion[];
  settings: QuizPayloadSettings;
}

// ===== CREATE QUIZ PAYLOAD (for API) =====
export interface CreateQuizPayload {
  title: string;
  description?: string;
  userId: number;
  categoryId?: number;
  visibility?: Visibility;
  language?: Language;
  questionType?: QuestionType | "MIXED";
  numberOfQuestions?: number;
  mode?: QuizMode;
  difficulty?: Difficulty;
  task?: Task;
  parsingMode?: ParsingMode;
  sourceType?: SourceType;
  sourceContent?: string;
  isAiGenerated?: boolean;
  aiModel?: AIModel;
  generationMode?: GenerationMode;
  fileProcessingMode?: FileProcessingMode;
  quizData: QuizPayloadData;
  tags?: string[];
  estimatedTime?: number;
  passingScore?: number;
}

// ===== API REQUEST/RESPONSE =====
export interface CreateQuizRequest {
  title: string;
  description?: string;
  category_id?: number;
  quiz_data: QuizData;
}

export interface UpdateQuizRequest {
  id: number;
  title?: string;
  description?: string;
  category_id?: number;
  quiz_data?: Partial<QuizData>;
}

export interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  user_id: number;
  category_id?: number;
  quiz_data: QuizData;
  created_at: string;
  updated_at: string;
}

// ===== OPTIONS INTERFACES =====
export interface QuizSettingsOptions {
  isAiGenerated?: boolean;
  generationMode?: GenerationMode;
  fileProcessingMode?: FileProcessingMode;
  visibility?: Visibility;
  language?: Language;
  questionType?: QuestionType | "MIXED";
  mode?: QuizMode;
  difficulty?: Difficulty;
  sourceType?: SourceType;
  sourceContent?: string;
  aiModel?: AIModel;
  userId: number;
}

// ===== LEGACY INTERFACES (for backward compatibility) =====
export interface QuestionData {
  id: string;
  question: string;
  type: QuestionType;
  difficulty?: Difficulty;
  points?: number;
  explanation?: string;
  tags?: string[];
  answers: Answer[];
  shortAnswerText?: string;
}

// ===== BACKEND COMPATIBLE TYPES =====
export interface BackendQuizEntity {
  id?: number;
  title: string;
  description?: string;
  userId: number;
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

export interface AutoSaveQuizPayload {
  title: string;
  description?: string;
  userId: number;
  categoryId?: number;
  visibility: Visibility;
  language: Language;
  questionType: QuestionType | "MIXED";
  numberOfQuestions: number;
  mode: QuizMode;
  difficulty: Difficulty;
  task: string;
  parsingMode: ParsingMode;
  sourceType: SourceType;
  sourceContent?: string;
  isAiGenerated: boolean;
  aiModel?: string;
  generationMode: GenerationMode;
  fileProcessingMode: FileProcessingMode;
  quizData: {
    questions: QuestionData[];
    settings: any;
    metadata: any;
  };
  tags: string[];
  estimatedTime: number;
  passingScore: number;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuestionData[];
  settings?: QuizSettings;
  metadata?: {
    total_questions: number;
    total_points: number;
    estimated_time: number;
    tags: string[];
    category?: string;
    subject?: string;
    grade_level?: string;
  };
  // Add backend compatibility
  savedQuizId?: number;
  isAutoSaved?: boolean;
  lastSavedAt?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "success" | "error";
  progress: number;
  error?: string;
  parsedContent?: string;
  extractedQuestions?: QuestionData[];
  actualFile?: File;
}
