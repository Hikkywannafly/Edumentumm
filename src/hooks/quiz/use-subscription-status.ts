import { subscriptionAPI } from "@/lib/api/subscription";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planType: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export function useSubscriptionStatus() {
  return useQuery<SubscriptionStatus>({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      try {
        return await subscriptionAPI.getSubscriptionStatus();
      } catch (error) {
        console.error("Failed to fetch subscription status:", error);
        // Return default free status if there's an error
        return {
          hasActiveSubscription: false,
          planType: "FREE",
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}
