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

// GET /api/flashcards/[id] - Get flashcard by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const headers = getAuthHeaders(request);

    const response = await fetch(`${API_BASE_URL}/student/flashcards/${id}`, {
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
      { error: "Failed to fetch flashcard" },
      { status: 500 },
    );
  }
}

// PATCH /api/flashcards/[id] - Update flashcard
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const headers = getAuthHeaders(request);

    const response = await fetch(`${API_BASE_URL}/student/flashcards/${id}`, {
      method: "PATCH",
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
      { error: "Failed to update flashcard" },
      { status: 500 },
    );
  }
}

// DELETE /api/flashcards/[id] - Delete flashcard
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const headers = getAuthHeaders(request);

    const response = await fetch(`${API_BASE_URL}/student/flashcards/${id}`, {
      method: "DELETE",
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Failed to delete flashcard" },
      { status: 500 },
    );
  }
}
