"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Crown, Star, Users, Zap } from "lucide-react";
import { useState } from "react";
import { PaymentForm } from "./payment-form";
import { PaymentMethods } from "./payment-methods";
import { SecurityBadges } from "./security-badges";

export default function PaymentContent() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState("Pro");

  const packages = {
    Plus: {
      id: "PLUS1",
      name: "Gói Plus",
      price: 299000,
      originalPrice: 399000,
      icon: <Zap className="h-5 w-5" />,
      color: "bg-blue-600",
      features: [
        "Truy cập tất cả khóa học cơ bản",
        "Tài liệu ôn tập PDF",
        "Hỗ trợ qua email",
        "Thời hạn 3 tháng",
      ],
      popular: false,
    },
    Pro: {
      id: "PRO1",
      name: "Gói Pro",
      price: 599000,
      originalPrice: 799000,
      icon: <Crown className="h-5 w-5" />,
      color: "bg-yellow-500",
      features: [
        "Tất cả tính năng gói Plus",
        "Khóa học nâng cao & chuyên sâu",
        "Video bài giảng HD không giới hạn",
        "Hỗ trợ 1-1 với giáo viên",
        "Thi thử không giới hạn",
        "Thời hạn 6 tháng",
      ],
      popular: true,
    },
  };

  const currentPackage = packages[selectedPackage as keyof typeof packages];

  const handlePayment = () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-full overflow-hidden px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-2xl text-foreground">
                Nâng cấp tài khoản
              </h1>
              <p className="text-muted-foreground">
                Chọn gói phù hợp để truy cập đầy đủ tính năng
              </p>
            </div>
            <Badge
              variant="secondary"
              className="flex flex-shrink-0 items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Ưu đãi còn 2 ngày
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full overflow-hidden px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chọn gói dịch vụ</CardTitle>
                <CardDescription>
                  Lựa chọn gói phù hợp với nhu cầu học tập
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(packages).map(([key, pkg]) => (
                    <div
                      key={key}
                      className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        selectedPackage === key
                          ? "border-blue-600 bg-gray-100 text-black dark:border-white dark:bg-gray-900 dark:text-white"
                          : "border-border bg-card text-card-foreground hover:border-gray-400"
                      }`}
                      onClick={() => setSelectedPackage(key)}
                    >
                      {pkg.popular && (
                        <Badge className="-top-2 absolute left-4 bg-black text-white dark:bg-white dark:text-black">
                          Phổ biến nhất
                        </Badge>
                      )}

                      <div className="mb-3 flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 text-white ${pkg.color}`}
                        >
                          {pkg.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-black dark:text-white">
                            {pkg.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-black text-lg dark:text-white">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(pkg.price)}
                            </span>
                            <span className="text-gray-500 text-sm line-through dark:text-gray-400">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(pkg.originalPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {pkg.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-white" />
                            <span className="break-words text-gray-800 dark:text-gray-200">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <PaymentMethods
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />

            <PaymentForm
              selectedMethod={selectedMethod}
              amount={currentPackage.price}
              content={currentPackage.id}
              onPayment={handlePayment}
            />
          </div>

          <div className="min-w-0 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  {currentPackage.icon}
                  <span className="truncate">{currentPackage.name}</span>
                </CardTitle>
                <CardDescription>Chi tiết gói dịch vụ đã chọn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {currentPackage.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-white" />
                      <span className="break-words text-foreground text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Giá gốc:</span>
                    <span className="text-muted-foreground text-sm line-through">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(currentPackage.originalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Giảm giá:</span>
                    <span className="font-medium text-black text-sm dark:text-white">
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        currentPackage.originalPrice - currentPackage.price,
                      )}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between font-bold text-lg">
                    <span className="text-foreground">Tổng thanh toán:</span>
                    <span className="text-base text-black lg:text-lg dark:text-white">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(currentPackage.price)}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-300 bg-gray-100 p-3 text-center dark:border-gray-600 dark:bg-gray-800">
                  <div className="font-medium text-gray-800 text-sm dark:text-gray-200">
                    🎉 Bạn tiết kiệm được{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(
                      currentPackage.originalPrice - currentPackage.price,
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <SecurityBadges />

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 text-center font-semibold">
                  Học viên tin tưởng
                </h3>
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <div className="font-medium text-sm">
                    4.9/5 từ 12,450 đánh giá
                  </div>
                  <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                    <Users className="h-4 w-4" />
                    <span>Hơn 50,000 học viên đã nâng cấp</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
