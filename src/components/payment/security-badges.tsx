import { Card, CardContent } from "@/components/ui/card";
import { Award, CheckCircle, Lock, Shield } from "lucide-react";

export function SecurityBadges() {
  const securityFeatures = [
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Bảo mật SSL",
      description: "Mã hóa 256-bit",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      title: "PCI DSS",
      description: "Tuân thủ chuẩn bảo mật",
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Được cấp phép",
      description: "Ngân hàng Nhà nước VN",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Đáng tin cậy",
      description: "1M+ giao dịch thành công",
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 text-center font-semibold">Cam kết bảo mật</h3>
        <div className="grid grid-cols-2 gap-4">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="text-primary">{feature.icon}</div>
              <div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-muted-foreground text-xs">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
