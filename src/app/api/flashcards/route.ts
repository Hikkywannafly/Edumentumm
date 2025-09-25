import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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

// GET /api/flashcards - Get all flashcards with pagination, search, and sort
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all query parameters
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "6";
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy");

    const headers = getAuthHeaders(request);

    // Build backend URL with all parameters
    const backendParams = new URLSearchParams({
      page,
      size,
    });

    if (search && search.trim()) {
      backendParams.append("search", search.trim());
    }

    if (sortBy && sortBy.trim()) {
      backendParams.append("sortBy", sortBy.trim());
    }

    const backendUrl = `${API_BASE_URL}/student/flashcards?${backendParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || `HTTP error! status: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 },
    );
  }
}

// POST /api/flashcards - Create new flashcard set
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = getAuthHeaders(request);

    const response = await fetch(`${API_BASE_URL}/student/flashcards`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || `HTTP error! status: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to create flashcard set" },
      { status: 500 },
    );
  }
}
