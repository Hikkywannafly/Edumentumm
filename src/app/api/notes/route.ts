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

// GET /api/notes - Get all notes with pagination, search, and sort
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get all query parameters
    const page = searchParams.get("page") || "0";
    const size = searchParams.get("size") || "12";
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    const headers = getAuthHeaders(request);

    // Build backend URL with all parameters
    const backendParams = new URLSearchParams({
      page,
      size,
      sortBy,
      sortDir,
    });

    if (search && search.trim()) {
      backendParams.append("search", search.trim());
    }

    const backendUrl = `${API_BASE_URL}/user/notes?${backendParams.toString()}`;

    console.log("Calling backend URL:", backendUrl);
    console.log("Headers:", headers);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(`Backend error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("Error response:", errorText);

      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          {
            error:
              errorData.message || `HTTP error! status: ${response.status}`,
          },
          { status: response.status },
        );
      } catch {
        return NextResponse.json(
          {
            error: `HTTP error! status: ${response.status}`,
          },
          { status: response.status },
        );
      }
    }

    const data = await response.json();
    console.log("Backend response:", data);

    // Transform backend response to match frontend expectations
    const transformedResponse = {
      content: data.data || [],
      page: data.pagination?.currentPage || 0,
      size: data.pagination?.pageSize || 12,
      totalElements: data.pagination?.totalElements || 0,
      totalPages: data.pagination?.totalPages || 0,
      first: data.pagination?.currentPage === 0,
      last: !data.pagination?.hasNext,
      empty: (data.data || []).length === 0,
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error("Error in notes API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = getAuthHeaders(request);

    const backendUrl = `${API_BASE_URL}/user/notes`;

    const response = await fetch(backendUrl, {
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
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
