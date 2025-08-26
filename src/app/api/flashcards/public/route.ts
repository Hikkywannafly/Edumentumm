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

// GET /api/flashcards/public - Get public flashcards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "6";

    const headers = getAuthHeaders(request);

    const response = await fetch(
      `${API_BASE_URL}/student/flashcards/public?page=${page}&size=${size}`,
      {
        method: "GET",
        headers,
      },
    );

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
      { error: "Failed to fetch public flashcards" },
      { status: 500 },
    );
  }
}
