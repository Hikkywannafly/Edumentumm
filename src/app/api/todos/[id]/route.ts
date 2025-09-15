import axios from "axios";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get authorization header
function getAuthHeaders(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader ? { Authorization: authHeader } : {};
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeaders = getAuthHeaders(request);
    const body = await request.json();
    const todoId = params.id;

    const response = await axios.put(
      `${API_BASE_URL}/user/todos/${todoId}`,
      body,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating todo:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "Failed to update todo" },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authHeaders = getAuthHeaders(request);
    const todoId = params.id;

    const response = await axios.delete(
      `${API_BASE_URL}/user/todos/${todoId}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error deleting todo:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "Failed to delete todo" },
        { status: error.response?.status || 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
