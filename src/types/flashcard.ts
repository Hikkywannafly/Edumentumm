export interface FlashcardData {
  id: number;
  // For questions type
  question?: string;
  choices?: string[];
  correctAnswer?: number;
  explanation?: string;
  // For vocabulary type
  vocabulary?: string;
  meaning?: string;
  example?: string;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  roles: Role[];
  isActive: boolean;
}

export interface Role {
  id: number;
  name: string;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  categoryId?: number;
  isPublic: boolean;
  createdAt: string;
  user?: User;
  flashcards: FlashcardData[];
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface FlashcardApiResponse {
  pagination: PaginationInfo;
  data: FlashcardSet[];
  message: string;
  status: string;
}

export interface FlashcardSetApiResponse {
  status: string;
  message: string;
  data: FlashcardSet;
}

export interface FlashcardStats {
  totalFlashcards: number;
  totalDecks: number;
  averageScore: number;
  studyTime: string;
}
