"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

interface PaymentFormProps {
  selectedMethod: string | null;
  amount: number;
  onPayment: () => void;
  content: string;
}

export function PaymentForm({
  selectedMethod,
  amount,
  content,
}: PaymentFormProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const qrInfo = {
    bank: "MB",
    account: "0911916271",
    owner: "TRA QUANG THANG",
    amount: formatAmount(amount),
    content: content,
    expire: "29:50",
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case "qr-code":
      case "momo":
        return (
          <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-zinc-600 border-dashed p-6 shadow-lg md:flex-row">
            <div className="min-w-[240px] flex-1">
              <div className="mb-3 flex items-center gap-2 font-semibold text-lg">
                <span role="img" aria-label="bank" className="text-2xl">
                  🏦
                </span>
                Chuyển khoản ngân hàng
              </div>
              <div className="mb-3 font-medium text-blue-400 text-sm">
                Chú ý: nhập chính xác nội dung bên dưới
              </div>
              <table className="mb-2 w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1 pr-4">Ngân hàng</td>
                    <td className="py-1 font-semibold text-red-600">
                      {qrInfo.bank}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">Số tài khoản</td>
                    <td className="py-1 font-bold font-mono text-base">
                      {qrInfo.account}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">Chủ tài khoản</td>
                    <td className="py-1">{qrInfo.owner}</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">Số tiền</td>
                    <td className="py-1 font-bold text-blue-400">
                      {qrInfo.amount}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">Nội dung</td>
                    <td className="py-1 font-mono text-base text-yellow-400">
                      {qrInfo.content}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-xl bg-white p-2 shadow-md">
                <img
                  src={`https://img.vietqr.io/image/${qrInfo.bank}-${qrInfo.account}-qr_only.png?amount=${amount}&addInfo=${qrInfo.content}`}
                  alt="QR code"
                  className="h-40 w-40 rounded-lg"
                />
              </div>
              <div className="mt-2 text-xs">Thời gian còn lại</div>
              <div className="font-bold text-3xl text-blue-400 tracking-widest">
                {qrInfo.expire}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin thanh toán</CardTitle>
        <CardDescription>Nhập thông tin để hoàn tất thanh toán</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Tổng thanh toán:</span>
            <span className="font-bold text-2xl text-primary">
              {formatAmount(amount)}
            </span>
          </div>
        </div>
        {renderPaymentForm()}
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
          <Lock className="h-4 w-4 text-primary" />
          <span className="text-sm">
            Thông tin của bạn được bảo mật với mã hóa SSL 256-bit
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
