import { apiClient } from "@/lib/api/client";
import { useEffect, useState } from "react";

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planType: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/subscription/status");
        if (response.data.success) {
          setSubscription(response.data.data);
        } else {
          setError("Failed to fetch subscription status");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setSubscription({
          hasActiveSubscription: false,
          planType: "FREE",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);

  return { subscription, loading, error };
}
