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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ThinLayout from "../layout/thin-layout";

export default function PaymentSuccess() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "processing" | "error"
  >("processing");

  useEffect(() => {
    const processPayment = async () => {
      try {
        const vnpay = searchParams.get("vnpay");
        const packageId = searchParams.get("packageId");

        if (vnpay === "success" && packageId) {
          // Confirm payment with backend
          const response = await subscriptionAPI.confirmPayment({
            packageId: packageId,
            paymentMethod: "vnpay",
            transactionId: `vnpay_${Date.now()}`,
          });

          if (response.success) {
            setPaymentStatus("success");
          } else {
            setPaymentStatus("error");
          }
        } else {
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("Payment confirmation error:", error);
        setPaymentStatus("error");
      } finally {
        setIsLoading(false);
      }
    };

    processPayment();
  }, [searchParams]);

  const handleContinue = () => {
    router.push(`/${locale}/dashboard`);
  };

  if (isLoading) {
    return (
      <ThinLayout classNames="container py-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-bold text-2xl">Đang xử lý thanh toán...</h1>
          <p className="mt-2 text-muted-foreground">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </ThinLayout>
    );
  }

  return (
    <ThinLayout classNames="container py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            {paymentStatus === "success" ? (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-8 w-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <CardTitle className="text-green-600">
                  Thanh toán thành công!
                </CardTitle>
                <CardDescription>
                  Tài khoản Pro của bạn đã được kích hoạt
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <CardTitle className="text-red-600">
                  Thanh toán thất bại
                </CardTitle>
                <CardDescription>
                  Đã có lỗi xảy ra trong quá trình thanh toán
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="text-center">
            {paymentStatus === "success" ? (
              <div className="space-y-4">
                <p>
                  Cảm ơn bạn đã nâng cấp lên tài khoản Pro. Tất cả các tính năng
                  cao cấp đã được mở khóa.
                </p>
                <Button onClick={handleContinue} className="w-full">
                  Tiếp tục đến bảng điều khiển
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p>
                  Không thể xác nhận thanh toán của bạn. Vui lòng thử lại hoặc
                  liên hệ hỗ trợ.
                </p>
                <Button
                  onClick={() => router.push(`/${locale}/payment`)}
                  variant="outline"
                  className="w-full"
                >
                  Thử lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ThinLayout>
  );
}
