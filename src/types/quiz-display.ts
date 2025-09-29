// Add UserDisplay type
export interface UserDisplay {
  userId: number;
  username: string;
  imageUrl?: string | null;
}

export interface QuizDisplayData {
  id: number;
  title: string;
  description: string;
  slug: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  totalQuestions: number;
  estimatedTime: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  visibility: "PUBLIC" | "PRIVATE";
  tags: (
    | string
    | { name: string; description?: string; icon?: string; color?: string }
  )[];
  keywords: string[];
  createdAt: string;
  viewCount: number;
  attemptCount: number;
  bestCorrectAnswers?: number;
  maxAttempts?: number;
  publishedAt?: string | null;
  lastAttemptAt?: string;
  // Add user field
  user?: UserDisplay;
}

export interface QuizCardProps {
  quiz: QuizDisplayData;
  turnButton?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (quiz: QuizDisplayData) => void;
  onView?: (quiz: QuizDisplayData) => void;
}

export interface QuizStatsData {
  totalQuizzes: number;
  publishedQuizzes: number;
  draftQuizzes: number;
  totalAttempts: number;
}

export interface QuizFiltersProps {
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  searchPlaceholder?: string;
  filtersLabel?: string;
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  onSortChange?: (sortBy: string) => void;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  createHref: string;
}
