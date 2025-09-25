import type {
  FlashcardApiResponse,
  FlashcardSet,
  FlashcardSetApiResponse,
  FlashcardStats,
} from "@/types/flashcard";

export interface CreateFlashcardSetRequest {
  title: string;
  description: string;
  categoryId?: number;
  flashcardType?: "QUESTIONS" | "VOCABULARY";
  isPublic: boolean;
  flashcards: Array<{
    // For questions type
    question?: string;
    choices?: string[];
    correctAnswer?: number;
    explanation?: string;
    // For vocabulary type
    vocabulary?: string;
    meaning?: string;
    example?: string;
  }>;
}

export interface UpdateFlashcardSetRequest {
  title?: string;
  description?: string;
  categoryId?: number;
  flashcardType?: "QUESTIONS" | "VOCABULARY";
  isPublic?: boolean;
  flashcards?: Array<{
    id?: number;
    // For questions type
    question?: string;
    choices?: string[];
    correctAnswer?: number;
    explanation?: string;
    // For vocabulary type
    vocabulary?: string;
    meaning?: string;
    example?: string;
  }>;
}

class FlashcardService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    // Use Next.js API routes instead of direct external API calls
    const url = `/api${endpoint}`;

    const accessToken = localStorage.getItem("accessToken");

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("❌ API Error data:", errorData);
        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unexpected error occurred");
    }
  }

  async getAllFlashcards(
    page = 0,
    size = 6,
    search?: string,
    sortBy?: string,
  ): Promise<FlashcardApiResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      // Only send sortBy to backend if it's not "recent" (default)
      if (sortBy && sortBy.trim() && sortBy !== "recent") {
        params.append("sortBy", sortBy.trim());
      }

      const response = await this.request<FlashcardApiResponse>(
        `/flashcards?${params.toString()}`,
      );
      return response;
    } catch (error) {
      console.error("❌ FlashcardService: Error fetching flashcards:", error);
      throw error;
    }
  }

  async getPublicFlashcards(page = 0, size = 6): Promise<FlashcardApiResponse> {
    try {
      const response = await this.request<FlashcardApiResponse>(
        `/flashcards/public?page=${page}&size=${size}`,
      );
      return response;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error fetching public flashcards:",
        error,
      );
      throw error;
    }
  }

  async getFlashcardById(id: number): Promise<FlashcardSet> {
    try {
      const response = await this.request<FlashcardSetApiResponse>(
        `/flashcards/${id}`,
      );
      return response.data;
    } catch (error) {
      console.error("❌ FlashcardService: Error fetching flashcard:", error);
      throw error;
    }
  }

  // Utility function to truncate text safely
  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    // Find the last space before the limit to avoid cutting words
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > maxLength * 0.8) {
      return `${truncated.substring(0, lastSpace)}...`;
    }
    return `${truncated.substring(0, maxLength - 3)}...`;
  }

  // Validate and sanitize flashcard data before sending to API
  private validateFlashcardData(
    data: CreateFlashcardSetRequest,
  ): CreateFlashcardSetRequest {
    return {
      ...data,
      title: this.truncateText(data.title, 255),
      description: this.truncateText(data.description, 500),
      categoryId: data.categoryId,
      flashcards: data.flashcards.map((flashcard) => {
        if (flashcard.vocabulary) {
          // Vocabulary type flashcard
          return {
            vocabulary: this.truncateText(flashcard.vocabulary, 200),
            meaning: this.truncateText(flashcard.meaning || "", 250),
            example: this.truncateText(flashcard.example || "", 300),
            explanation: this.truncateText(flashcard.explanation || "", 250),
          };
        }

        // Question type flashcard
        return {
          question: this.truncateText(flashcard.question || "", 250),
          choices: (flashcard.choices || []).map((choice) =>
            this.truncateText(choice, 200),
          ),
          correctAnswer: flashcard.correctAnswer || 0,
          explanation: this.truncateText(flashcard.explanation || "", 250),
        };
      }),
    };
  }

  // Validate and sanitize update flashcard data
  private validateUpdateFlashcardData(
    data: UpdateFlashcardSetRequest,
  ): UpdateFlashcardSetRequest {
    return {
      ...data,
      title: data.title ? this.truncateText(data.title, 255) : data.title,
      description: data.description
        ? this.truncateText(data.description, 500)
        : data.description,
      categoryId: data.categoryId,
      flashcards: data.flashcards?.map((flashcard) => {
        if (flashcard.vocabulary) {
          // Vocabulary type flashcard
          return {
            ...flashcard,
            vocabulary: this.truncateText(flashcard.vocabulary, 200),
            meaning: this.truncateText(flashcard.meaning || "", 250),
            example: this.truncateText(flashcard.example || "", 300),
            explanation: this.truncateText(flashcard.explanation || "", 250),
          };
        }

        // Question type flashcard
        return {
          ...flashcard,
          question: this.truncateText(flashcard.question || "", 250),
          choices: (flashcard.choices || []).map((choice) =>
            this.truncateText(choice, 200),
          ),
          correctAnswer: flashcard.correctAnswer || 0,
          explanation: this.truncateText(flashcard.explanation || "", 250),
        };
      }),
    };
  }

  async createFlashcardSet(
    flashcardSetData: CreateFlashcardSetRequest,
  ): Promise<FlashcardSet> {
    try {
      // Validate and sanitize data before sending to API
      const validatedData = this.validateFlashcardData(flashcardSetData);

      const response = await this.request<FlashcardSetApiResponse>(
        "/flashcards",
        {
          method: "POST",
          body: JSON.stringify(validatedData),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error creating flashcard set:",
        error,
      );
      throw error;
    }
  }

  async updateFlashcardSet(
    id: number,
    flashcardSetData: UpdateFlashcardSetRequest,
  ): Promise<FlashcardSet> {
    try {
      // Validate and sanitize data before sending to API
      const validatedData = this.validateUpdateFlashcardData(flashcardSetData);

      const response = await this.request<FlashcardSetApiResponse>(
        `/flashcards/${id}`,
        {
          method: "PATCH",
          body: JSON.stringify(validatedData),
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error updating flashcard set:",
        error,
      );
      throw error;
    }
  }

  async deleteFlashcardSet(id: number): Promise<void> {
    try {
      await this.request(`/flashcards/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error deleting flashcard set:",
        error,
      );
      throw error;
    }
  }

  calculateStats(
    flashcards: FlashcardSet[],
    pagination?: { totalElements: number },
  ): FlashcardStats {
    const totalDecks = pagination?.totalElements ?? flashcards.length;
    const totalFlashcards = flashcards.reduce(
      (sum, deck) => sum + deck.flashcards.length,
      0,
    );

    // For now, returning default values since we don't have score/study time data
    return {
      totalFlashcards,
      totalDecks,
      averageScore: 0, // This would need to come from user progress data
      studyTime: "0h", // This would need to come from user activity data
    };
  }
}

export const flashcardService = new FlashcardService();
