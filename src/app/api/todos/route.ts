import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get authorization header
function getAuthHeaders(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader ? { Authorization: authHeader } : {};
}

// GET /api/todos - Get all todos
export async function GET(request: NextRequest) {
  try {
    const authHeaders = getAuthHeaders(request);

    const response = await axios.get(`${API_BASE_URL}/user/todos`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching todos:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "Failed to fetch todos" },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const authHeaders = getAuthHeaders(request);
    const body = await request.json();

    const response = await axios.post(`${API_BASE_URL}/user/todos`, body, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error creating todo:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "Failed to create todo" },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
