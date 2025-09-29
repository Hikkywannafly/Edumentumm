"use client";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Shield, Star, Wallet } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  fee?: string;
  processingTime: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit-card",
    name: "Thẻ tín dụng",
    description: "Visa, Mastercard, American Express",
    icon: <Wallet className="h-6 w-6 text-blue-600" />,
    popular: false,
    fee: "Miễn phí",
    processingTime: "Tức thì",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: <Wallet className="h-6 w-6 text-blue-600" />,
    fee: "Miễn phí",
    processingTime: "Tức thì",
  },
  {
    id: "qr-code",
    name: "Quét mã QR",
    description: "VietQR - Quét mã thanh toán",
    icon: <QrCode className="h-6 w-6 text-blue-600" />,
    fee: "Miễn phí",
    processingTime: "Tức thì",
  },
  {
    id: "vnpay",
    name: "VNPay",
    description: "Thanh toán qua ví điện tử VNPay",
    icon: <Wallet className="h-6 w-6 text-blue-600" />,
    fee: "Miễn phí",
    processingTime: "Tức thì",
  },
];

interface PaymentMethodsProps {
  selectedMethod: string | null;
  onSelectMethod: (methodId: string) => void;
}

export function PaymentMethods({
  selectedMethod,
  onSelectMethod,
}: PaymentMethodsProps) {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-medium text-sm">Chọn phương thức thanh toán</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMethod === method.id
                ? "bg-primary/5 ring-2 ring-blue-600"
                : "hover:border-primary/50"
            }`}
            onClick={() => onSelectMethod(method.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${
                      selectedMethod === method.id
                        ? "bg-blue-200 text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{method.name}</h3>
                      {method.popular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="mr-1 h-3 w-3" />
                          Phổ biến
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {method.description}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium text-primary">{method.fee}</div>
                  <div className="text-muted-foreground">
                    {method.processingTime}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
