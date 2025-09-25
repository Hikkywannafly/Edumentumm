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

// DELETE /api/flashcard-categories/[id] - Delete a flashcard category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const headers = getAuthHeaders(request);
    const { id: categoryId } = await params;

    // Validate category ID
    if (!categoryId || Number.isNaN(Number(categoryId))) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid category ID",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/student/flashcard-categories/${categoryId}`,
      {
        method: "DELETE",
        headers,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);

      if (response.status === 404) {
        return NextResponse.json(
          {
            status: "error",
            message: "Category not found",
          },
          { status: 404 },
        );
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in DELETE /api/flashcard-categories/[id]:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to delete flashcard category",
      },
      { status: 500 },
    );
  }
}
