import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface Report {
  date: string;
  content: string;
}

interface ReportsTabProps {
  reports: Report[];
  reminders: string[];
}

export function ReportsTab({ reports, reminders }: ReportsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Báo cáo hoạt động
        </CardTitle>
        <CardDescription>Cập nhật mới nhất về hoạt động nhóm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Badge variant="outline">{report.date}</Badge>
                  <p className="text-sm">{report.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 font-medium">Lưu ý quan trọng</h3>
          <div className="space-y-2">
            {reminders.map((reminder, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <p className="text-muted-foreground text-sm">{reminder}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
