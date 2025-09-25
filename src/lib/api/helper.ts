import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
export function getAuthToken(request: NextRequest): string | null {
  let authHeader = request.headers.get("authorization");

  if (!authHeader) {
    const cookies = request.headers.get("cookie");
    if (cookies) {
      const match = cookies.match(/accessToken=([^;]+)/);
      if (match) {
        authHeader = `Bearer ${match[1]}`;
      }
    }
  }

  return authHeader;
}
export function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "API request failed",
      },
      { status: error.response?.status || 500 },
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    },
    { status: 500 },
  );
}
