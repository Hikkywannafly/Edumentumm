import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { UserGroupResponse } from "../../../types/group";

export function MembersTab({ members }: { members?: UserGroupResponse[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-bold text-blue-700 text-xs">
          <Users className="h-5 w-5 text-blue-500" />
          Danh sách thành viên
        </CardTitle>
        <p className="text-muted-foreground text-xs">
          Tất cả thành viên trong nhóm học tập
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {members?.map((member) => (
            <div
              key={member?.id}
              className="flex items-center gap-4 rounded-sm border border-gray-100 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 shadow transition-all hover:shadow-lg"
            >
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                  <img src={member?.imageUrl} alt={member?.username} />
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-blue-800 text-sm">
                  {member?.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
