import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export interface FlashcardCategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateFlashcardCategoryRequest {
  name: string;
  description?: string;
}

export interface FlashcardCategoriesApiResponse {
  status: string;
  message: string;
  data: FlashcardCategory[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL_LOCAL;
// process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Helper function to get auth token from request
function getAuthHeaders(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authHeader) {
    headers.Authorization = authHeader;
  }

  return headers;
}

// GET /api/flashcard-categories - Get all flashcard categories
export async function GET(request: NextRequest) {
  try {
    const headers = getAuthHeaders(request);
    const response = await fetch(
      `${API_BASE_URL}/student/flashcard-categories`,
      {
        method: "GET",
        headers,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: FlashcardCategoriesApiResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/flashcard-categories:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch flashcard categories",
        data: [],
      },
      { status: 500 },
    );
  }
}

// POST /api/flashcard-categories - Create new flashcard category
export async function POST(request: NextRequest) {
  try {
    const headers = getAuthHeaders(request);
    const body: CreateFlashcardCategoryRequest = await request.json();

    // Validate request body
    if (!body.name || typeof body.name !== "string") {
      return NextResponse.json(
        {
          status: "error",
          message: "Category name is required",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/student/flashcard-categories`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { data: FlashcardCategory; status: string; message: string } =
      await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/flashcard-categories:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create flashcard category",
      },
      { status: 500 },
    );
  }
}
