import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const quizId = params.id;
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 },
      );
    }

    const response = await fetch(`${API_BASE_URL}/student/quizzes/${quizId}`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: "Failed to fetch quiz", details: errorData },
        { status: response.status },
      );
    }

    const quiz = await response.json();
    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Fetch quiz error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
