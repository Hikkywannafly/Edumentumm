export interface TagObjectDisplay {
  id?: number;
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  description?: string;
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
  tags: (string | TagObjectDisplay)[];
  createdAt: string;
  viewCount: number;
  attemptCount: number;
}

export interface QuizCardProps {
  quiz: QuizDisplayData;
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
