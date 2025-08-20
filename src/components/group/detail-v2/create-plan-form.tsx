import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Target } from "lucide-react";

export function CreatePlanForm() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tạo Plan Mới
        </CardTitle>
        <CardDescription>Tạo kế hoạch học tập cho nhóm</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium text-sm">Tên Plan</h3>
          <Input placeholder="Ví dụ: Luyện từ vựng tuần 2" />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Mô tả</h3>
          <Textarea placeholder="Mô tả chi tiết về plan học tập..." rows={3} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Ngày bắt đầu</h3>
            <Input type="date" />
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Thời gian</h3>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 ngày</SelectItem>
                <SelectItem value="7">7 ngày</SelectItem>
                <SelectItem value="14">14 ngày</SelectItem>
                <SelectItem value="30">30 ngày</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Môn học</h3>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Chọn môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="math">Toán</SelectItem>
              <SelectItem value="literature">Văn</SelectItem>
              <SelectItem value="english">Tiếng Anh</SelectItem>
              <SelectItem value="physics">Vật Lý</SelectItem>
              <SelectItem value="chemistry">Hóa Học</SelectItem>
              <SelectItem value="biology">Sinh Học</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm">Ghi chú</h3>
          <Textarea placeholder="Ghi chú thêm về plan..." rows={2} />
        </div>

        <Button className="w-full">
          <Target className="mr-2 h-4 w-4" />
          Tạo Plan
        </Button>
      </CardContent>
    </Card>
  );
}
