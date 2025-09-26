"use client";
import { Button } from "@/components/ui/button";
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
  onPayment,
}: PaymentFormProps) {
  const formatAmount = (amount: number) => {
    const dollars = amount / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(dollars);
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
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Chuyển khoản ngân hàng</h3>
            <div className="text-muted-foreground text-sm">
              Chú ý: nhập chính xác nội dung bên dưới
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Ngân hàng:</div>
              <div className="font-semibold text-red-600">{qrInfo.bank}</div>

              <div>Số tài khoản:</div>
              <div className="font-bold font-mono">{qrInfo.account}</div>

              <div>Chủ tài khoản:</div>
              <div>{qrInfo.owner}</div>

              <div>Số tiền:</div>
              <div className="font-bold text-blue-600">{qrInfo.amount}</div>

              <div>Nội dung:</div>
              <div className="font-mono text-yellow-600">{qrInfo.content}</div>
            </div>

            <div className="rounded-lg border p-2 text-center">
              <img
                src={`https://img.vietqr.io/image/${qrInfo.bank}-${qrInfo.account}-qr_only.png?amount=${amount}&addInfo=${qrInfo.content}`}
                alt="QR code"
                className="mx-auto h-32 w-32"
              />
              <div className="mt-2 text-xs">
                Thời gian còn lại: {qrInfo.expire}
              </div>
            </div>

            <Button className="w-full" onClick={onPayment}>
              Tôi đã thanh toán
            </Button>
          </div>
        );
      case "credit-card":
        return (
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Thanh toán bằng thẻ tín dụng</h3>

            <div className="space-y-3">
              <div>
                <label
                  className="mb-1 block font-medium text-sm"
                  htmlFor="cardNumber"
                >
                  Số thẻ
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="expiryDate"
                  >
                    Ngày hết hạn
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    placeholder="MM/YY"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block font-medium text-sm"
                    htmlFor="cvv"
                  >
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    placeholder="123"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <Button className="w-full" onClick={onPayment}>
                Thanh toán {formatAmount(amount)}
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="rounded-lg border p-6 text-center text-muted-foreground">
            Vui lòng chọn phương thức thanh toán
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderPaymentForm()}
      <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
        <Lock className="h-4 w-4 text-primary" />
        <span className="text-sm">
          Thông tin của bạn được bảo mật với mã hóa SSL 256-bit
        </span>
      </div>
    </div>
  );
}
