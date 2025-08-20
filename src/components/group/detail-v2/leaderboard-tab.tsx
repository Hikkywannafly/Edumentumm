import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface Member {
  id: number;
  name: string;
  initials: string;
  points: string;
  rank: number;
}

interface LeaderboardTabProps {
  members: Member[];
}

export function LeaderboardTab({ members }: LeaderboardTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-sm">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Bảng xếp hạng
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Ai đang dẫn đầu trong nhóm học tập của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border bg-card px-4 py-3 transition hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full font-semibold text-sm ${
                    member.rank === 1
                      ? "bg-yellow-400 text-white"
                      : member.rank === 2
                        ? "bg-gray-300 text-white"
                        : member.rank === 3
                          ? "bg-orange-400 text-white"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {member.rank}
                </span>

                {/* Avatar + Info */}
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {member.points} đmuted-foregroundmxs
                  </p>
                </div>
              </div>

              {/* Trophy icon chỉ cho top 1 */}
              {member.rank === 1 && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
