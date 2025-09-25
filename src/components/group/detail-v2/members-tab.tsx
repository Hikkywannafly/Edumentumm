import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import type { UserGroupResponse } from "../../../types/group";

export function MembersTab({ members }: { members?: UserGroupResponse[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-sm">
          <Users className="h-5 w-5 " />
          Danh sách thành viên
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Tất cả thành viên trong nhóm học tập
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members?.map((member) => (
            <Card
              key={member?.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <img src={member?.imageUrl} alt={member?.username} />
                  </Avatar>
                  <img
                    className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                      member?.imageUrl ? "bg-green-500" : "bg-gray-400"
                    }`}
                    aria-label={
                      member?.imageUrl
                        ? "Online status indicator"
                        : "Offline status indicator"
                    }
                  />
                </div>
                <div>
                  <p className="font-medium">{member?.username}</p>
                  {/* <p className="text-muted-foreground text-sm">
                    {member?.points} điểm
                  </p> */}
                </div>
              </div>
              {/* <Badge
                variant={member.isOnline ? "default" : "outline"}
                className="text-xs"
              >
                {member.isOnline ? "Đang online" : "Offline"}
              </Badge> */}
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
