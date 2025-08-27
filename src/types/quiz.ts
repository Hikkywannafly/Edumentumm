// ===== ENUMS & TYPES =====
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "FREE_RESPONSE";

// Tag interface for complex tag objects from backend
export interface TagObject {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

// Tag type that can be either string or complex object
export type Tag = string | TagObject;

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type BloomLevel =
  | "REMEMBER"
  | "UNDERSTAND"
  | "APPLY"
  | "ANALYZE"
  | "EVALUATE"
  | "CREATE";

export type Visibility = "PRIVATE" | "PUBLIC" | "UNLISTED" | "PREMIUM";

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
  tags: Tag[]; // Support both string and TagObject
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
  quizData: {
    questions: QuestionData[];
    settings?: any;
    metadata?: any;
  };
  tags?: string[];
  estimatedTime?: number;
  passingScore?: number;
}

// ===== API REQUEST/RESPONSE =====
// export interface CreateQuizRequest {
//   title: string;
//   description?: string;
//   category_id?: number;
//   quiz_data: QuizData;
// }

// export interface UpdateQuizRequest {
//   id: number;
//   title?: string;
//   description?: string;
//   category_id?: number;
//   quiz_data?: Partial<QuizData>;
// }

// export interface QuizResponse {
//   id: number;
//   title: string;
//   description?: string;
//   user_id: number;
//   category_id?: number;
//   quiz_data: QuizData;
//   created_at: string;
//   updated_at: string;
// }

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
export interface BackendQuestionOption {
  id: string;
  text: string;
}

export interface BackendQuestion {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: BackendQuestionOption[]; // Make optional to handle missing data
  explanation?: string;
  correctAnswer?: string; // ID of the correct option, also make optional
}

export interface BackendQuizData {
  summary?: string;
  questions?: BackendQuestion[]; // Make optional to handle missing data
  instructions?: string;
  introduction?: string;
}

export interface BackendUser {
  userId: number;
  username: string;
  email: string;
  roles: Array<{ id: number; name: string }>;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface BackendQuizEntity {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string | null;
  user: BackendUser;
  originalQuizId?: number | null;
  quizData?: BackendQuizData; // Make optional to handle missing data
  difficulty: Difficulty;
  estimatedTime: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  maxAttempts: number;
  isAiGenerated: boolean;
  aiModel?: string;
  sourceType?: SourceType;
  generationPrompt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string | null;
  keywords: string[];
  viewCount?: number | null;
  attemptCount?: number | null;
  completionCount?: number | null;
  avgScore?: number | null;
  avgCompletionTime?: number | null;
  bookmarkCount?: number | null;
  shareCount?: number | null;
  visibility: Visibility;
  status: QuizStatus;
  isFeatured?: boolean | null;
  isTrending?: boolean | null;
  isPremium: boolean;
  tags?: (string | TagObject)[] | null; // Can be array of strings or TagObjects
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
  parsingMode?: ParsingMode;
  metadata?: {
    totalPages?: number;
    processedPages?: number;
    skippedContent?: string[];
    processingTime?: number;
    parsingMode?: ParsingMode;
    originalFileSize?: number;
    contentLength?: number;
    processingTimestamp?: string;
    errorTimestamp?: string;
  };
}
