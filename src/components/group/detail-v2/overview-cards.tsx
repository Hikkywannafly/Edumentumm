"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Copy, Trophy, Users } from "lucide-react";

type OverviewCardsProps = {
  memberLimit?: number;
  memberCount?: number;
  key?: string;
};

export function OverviewCards({
  memberCount,
  memberLimit,
  key,
}: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Thành viên */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Thành viên</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{`${memberCount}/${memberLimit}`}</div>
          <p className="text-muted-foreground text-xs">Tạo ngày 8/10/2025</p>
        </CardContent>
      </Card>

      {/* Mã tham gia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Mã tham gia</CardTitle>
          <Copy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-xl tracking-wider">{key}</div>
          <Button variant="outline" size="sm" className="mt-2 w-full">
            Sao chép
          </Button>
        </CardContent>
      </Card>

      {/* Điểm đóng góp */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Điểm đóng góp</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">10.230</div>
          <Badge variant="secondary" className="mt-2">
            Legend
          </Badge>
        </CardContent>
      </Card>

      {/* Hoạt động */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Hoạt động</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-xl">Cao</div>
        </CardContent>
      </Card>
    </div>
  );
}
