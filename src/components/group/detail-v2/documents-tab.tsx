import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, FileText, MessageSquare } from "lucide-react";

export function DocumentsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Kho lưu trữ tài liệu
        </CardTitle>
        <CardDescription>
          Học tiếng Hàn cấp tốc - Notes & Reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">General Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nhóm dành cho các bạn luyện tập giao tiếp và từ vựng mỗi ngày.
              </p>
              <Button variant="outline" className="mt-3 bg-transparent">
                <FileText className="mr-2 h-4 w-4" />
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Từ vựng cơ bản</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  120 từ vựng thiết yếu
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Mẫu câu giao tiếp</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  50 mẫu câu thông dụng
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
