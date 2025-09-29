"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptionAPI } from "@/lib/api/subscription";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThinLayout from "../layout/thin-layout";
import { PaymentForm } from "./payment-form";
import { PaymentMethods } from "./payment-methods";

export default function PaymentContent() {
  const router = useRouter();
  const locale = useLocale();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const packageInfo = {
    id: "PRO_YEARLY",
    name: "Gói Pro (Năm)",
    price: 3,
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call backend to confirm payment and activate subscription
      const response = await subscriptionAPI.confirmPayment({
        packageId: packageInfo.id,
        paymentMethod: selectedMethod,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      if (response.success) {
        // Payment successful, redirect to dashboard with success message
        router.push(`/${locale}/dashboard?payment=success`);
      } else {
        throw new Error(response.message || "Payment failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Thanh toán thất bại. Vui lòng thử lại.");
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <ThinLayout classNames="container py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-2xl">Nâng cấp tài khoản Pro</h1>
          <p className="text-muted-foreground">
            Thanh toán hàng năm - tiết kiệm 40%
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin thanh toán</CardTitle>
            <CardDescription>
              Tổng thanh toán: {formatCurrency(packageInfo.price)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <PaymentMethods
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />

            <PaymentForm
              selectedMethod={selectedMethod}
              amount={packageInfo.price * 100}
              content={packageInfo.id}
              onPayment={handlePayment}
            />

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedMethod || isProcessing}
              onClick={handlePayment}
            >
              {isProcessing ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang xử lý...
                </>
              ) : (
                `Thanh toán ${formatCurrency(packageInfo.price)}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </ThinLayout>
  );
}
