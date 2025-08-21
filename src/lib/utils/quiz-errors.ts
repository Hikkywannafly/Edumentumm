// Centralized error handling for quiz operations

export class QuizError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any,
  ) {
    super(message);
    this.name = "QuizError";
  }
}

export class QuizValidationError extends QuizError {
  constructor(
    message: string,
    public validationErrors: string[],
  ) {
    super(message, "VALIDATION_ERROR", { validationErrors });
    this.name = "QuizValidationError";
  }
}

export class QuizAPIError extends QuizError {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message, "API_ERROR", { statusCode });
    this.name = "QuizAPIError";
  }
}

export class QuizProcessingError extends QuizError {
  constructor(
    message: string,
    public step: string,
  ) {
    super(message, "PROCESSING_ERROR", { step });
    this.name = "QuizProcessingError";
  }
}

// Error handler utility
export function handleQuizError(error: unknown): {
  message: string;
  code: string;
} {
  if (error instanceof QuizError) {
    return {
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    // Handle common error patterns
    if (error.message.includes("fetch")) {
      return {
        message: "Network error - please check your connection",
        code: "NETWORK_ERROR",
      };
    }

    if (error.message.includes("timeout")) {
      return {
        message: "Request timeout - please try again",
        code: "TIMEOUT_ERROR",
      };
    }

    if (error.message.includes("API key")) {
      return {
        message: "Invalid API key - please check your configuration",
        code: "AUTH_ERROR",
      };
    }

    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
    };
  }

  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const handled = handleQuizError(error);
    throw new QuizProcessingError(`${context}: ${handled.message}`, context);
  }
}
