"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import ThinLayout from "../layout/thin-layout";

export default function PaymentFailure() {
  const router = useRouter();
  const locale = useLocale();

  const handleRetry = () => {
    router.push(`/${locale}/payment`);
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or send an email
    alert("Chức năng liên hệ hỗ trợ sẽ được thực hiện sau");
  };

  return (
    <ThinLayout classNames="container py-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
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
              Thanh toán không thành công
            </CardTitle>
            <CardDescription>
              Đã có lỗi xảy ra trong quá trình thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p>
              Chúng tôi không thể xử lý thanh toán của bạn. Vui lòng thử lại
              hoặc liên hệ hỗ trợ nếu vấn đề tiếp tục xảy ra.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleRetry} className="flex-1">
                Thử lại
              </Button>
              <Button
                onClick={handleContactSupport}
                variant="outline"
                className="flex-1"
              >
                Liên hệ hỗ trợ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ThinLayout>
  );
}
