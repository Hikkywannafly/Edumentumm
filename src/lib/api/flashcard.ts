import type {
  FlashcardApiResponse,
  FlashcardSet,
  FlashcardSetApiResponse,
  FlashcardStats,
} from "@/types/flashcard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface CreateFlashcardSetRequest {
  title: string;
  description: string;
  isPublic: boolean;
  flashcards: Array<{
    question: string; // Should be <= 250 characters
    choices: string[]; // Each choice <= 200 characters
    correctAnswer: number;
    explanation?: string; // Should be <= 250 characters
  }>;
}

export interface UpdateFlashcardSetRequest {
  title?: string; // Should be <= 255 characters
  description?: string; // Should be <= 500 characters
  isPublic?: boolean;
  flashcards?: Array<{
    id?: number;
    question: string; // Should be <= 250 characters
    choices: string[]; // Each choice <= 200 characters
    correctAnswer: number;
    explanation?: string; // Should be <= 250 characters
  }>;
}

class FlashcardService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

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
          errorData.message || `HTTP error! status: ${response.status}`,
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

  async getAllFlashcards(): Promise<FlashcardApiResponse> {
    try {
      const response = await this.request<FlashcardApiResponse>(
        "/student/flashcards",
      );
      return response;
    } catch (error) {
      console.error("❌ FlashcardService: Error fetching flashcards:", error);
      throw error;
    }
  }

  async getPublicFlashcards(): Promise<FlashcardApiResponse> {
    try {
      // Try the current endpoint first
      const response = await this.request<FlashcardApiResponse>(
        "/student/flashcards/public",
      );
      return response;
    } catch (error) {
      console.error(
        "❌ FlashcardService: Error fetching public flashcards:",
        error,
      );

      // If 403, try a different approach - maybe all flashcards with filtering
      if (error instanceof Error && error.message.includes("403")) {
        try {
          const allFlashcards = await this.getAllFlashcards();
          // Filter only public flashcards
          const publicFlashcards = {
            ...allFlashcards,
            data: allFlashcards.data.filter((flashcard) => flashcard.isPublic),
          };
          return publicFlashcards;
        } catch (fallbackError) {
          console.error("❌ Fallback also failed:", fallbackError);
          throw error; // Throw original error
        }
      }

      throw error;
    }
  }

  async getFlashcardById(id: number): Promise<FlashcardSet> {
    try {
      const response = await this.request<FlashcardSetApiResponse>(
        `/student/flashcards/${id}`,
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
      flashcards: data.flashcards.map((flashcard) => ({
        ...flashcard,
        question: this.truncateText(flashcard.question, 250),
        choices: flashcard.choices.map((choice) =>
          this.truncateText(choice, 200),
        ),
        explanation: this.truncateText(flashcard.explanation || "", 250),
      })),
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
      flashcards: data.flashcards?.map((flashcard) => ({
        ...flashcard,
        question: this.truncateText(flashcard.question, 250),
        choices: flashcard.choices.map((choice) =>
          this.truncateText(choice, 200),
        ),
        explanation: this.truncateText(flashcard.explanation || "", 250),
      })),
    };
  }

  async createFlashcardSet(
    flashcardSetData: CreateFlashcardSetRequest,
  ): Promise<FlashcardSet> {
    try {
      // Validate and sanitize data before sending to API
      const validatedData = this.validateFlashcardData(flashcardSetData);

      const response = await this.request<FlashcardSetApiResponse>(
        "/student/flashcards",
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
        `/student/flashcards/${id}`,
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
      await this.request(`/student/flashcards/${id}`, {
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

  calculateStats(flashcards: FlashcardSet[]): FlashcardStats {
    const totalDecks = flashcards.length;
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
