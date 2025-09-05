import { apiClient } from "@/lib/api/client";
import { getAuthToken, handleApiError } from "@/lib/api/helper";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const QuerySchema = z.object({
  page: z.string().optional().default("0"),
  title: z.string().optional(),
  size: z.string().optional().default("6"),
  search: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "UNLISTED", "PREMIUM"]).optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validated = QuerySchema.safeParse(queryParams);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: validated.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validated.data;

    const authToken = getAuthToken(request);
    const headers = authToken ? { Authorization: authToken } : {};

    if (!authToken) {
      console.warn("No authentication token available for backend request");
    }

    const direction = data.sortDirection.toUpperCase() as "ASC" | "DESC";

    const params = new URLSearchParams({
      page: data.page,
      size: data.size,
      sortBy: data.sortBy,
      direction,
    });
    const search = data.search?.trim();
    let endpoint: string;

    if (search) {
      params.set("title", search);
      endpoint = `/student/quizzes/search/page?${params.toString()}`;
    } else {
      endpoint = `/student/quizzes/page?${params.toString()}`;
    }

    const response = await apiClient.get(endpoint, { headers });

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
