import { apiClient } from "@/lib/api/client";
import { getAuthToken, handleApiError } from "@/lib/api/helper";
import { type NextRequest, NextResponse } from "next/server";

interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  planType: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request);

    if (!authToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    const headers = {
      Authorization: authToken,
    };

    try {
      const response = await apiClient.get<SubscriptionStatusResponse>(
        "/student/subscription/status",
        { headers },
      );

      return NextResponse.json({
        success: true,
        message: "Subscription status retrieved successfully",
        data: response.data,
      });
    } catch (_backendError) {
      // If backend call fails, return default free status
      return NextResponse.json({
        success: true,
        message: "Default free status",
        data: {
          hasActiveSubscription: false,
          planType: "FREE",
        },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
