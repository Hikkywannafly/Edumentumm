import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export function SecurityBadges() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground text-sm">
            Thanh toán an toàn với mã hóa SSL 256-bit
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
