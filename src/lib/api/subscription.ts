import { apiClient } from "@/lib/api/client";

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  planType: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

class SubscriptionAPI {
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await apiClient.get("/student/subscription/status");
      if (response.data.success) {
        return response.data.data;
      }

      // Fallback to direct backend call
      const backendResponse = await apiClient.get(
        "/student/subscription/status",
      );
      return backendResponse.data.data;
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
      // Return default free status if there's an error
      return {
        hasActiveSubscription: false,
        planType: "FREE",
      };
    }
  }

  async confirmPayment(paymentData: {
    packageId: string;
    paymentMethod: string;
    transactionId: string;
  }): Promise<any> {
    try {
      console.log("Confirming payment with data:", paymentData);
      const response = await apiClient.post(
        "/student/subscription/payment/confirm",
        paymentData,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      throw error;
    }
  }

  async createVNPayPayment(paymentData: {
    packageId: string;
  }): Promise<any> {
    try {
      console.log("Creating VNPay payment with data:", paymentData);
      const response = await apiClient.post(
        "/student/subscription/payment/vnpay/create",
        paymentData,
      );
      console.log("VNPay payment response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to create VNPay payment:", error);
      throw error;
    }
  }

  isProUser(status: SubscriptionStatus): boolean {
    return (
      status.hasActiveSubscription &&
      (status.planType === "PRO_MONTHLY" || status.planType === "PRO_YEARLY")
    );
  }
}

export const subscriptionAPI = new SubscriptionAPI();
