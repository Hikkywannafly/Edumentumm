"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Globe, Lock, Users } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import type { GroupResponse } from "../../types/group";

interface CheckRoleProps {
  ownerId: number;
}

function CheckRole({ ownerId }: CheckRoleProps) {
  const { user } = useAuth();
  if (!user) return null;

  const isOwner = user.userId === ownerId;

  return (
    <Badge
      variant={isOwner ? "secondary" : "outline"}
      className={`ml-2 rounded-full px-3 py-0.5 font-semibold text-xs tracking-wide ${
        isOwner
          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm"
          : ""
      }`}
    >
      {isOwner ? "OWNER" : "MEMBER"}
    </Badge>
  );
}

interface StudyGroupCardProps {
  iStudyGroupCard: GroupResponse;
  roleHidden?: boolean;
  publicHidden?: boolean;
  onClick?: (group: GroupResponse) => void;
}

export function StudyGroupCard({
  iStudyGroupCard,
  roleHidden,
  publicHidden,
  onClick,
}: StudyGroupCardProps) {
  const progress =
    (iStudyGroupCard.memberCount / iStudyGroupCard.memberLimit) * 100;

  return (
    <Card
      onClick={() => onClick?.(iStudyGroupCard)}
      className="flex h-[200px] w-full max-w-2xl cursor-pointer flex-col justify-between rounded-sm border border-gray-200 bg-white p-5 shadow-sm transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <CardTitle
          className="line-clamp-1 font-semibold text-lg"
          title={iStudyGroupCard.name}
        >
          {iStudyGroupCard.name}
        </CardTitle>

        {!publicHidden && (
          <Badge
            variant="outline"
            className={`flex items-center gap-1 font-medium text-xs ${
              iStudyGroupCard.public
                ? "border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900 dark:text-green-200"
                : "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {iStudyGroupCard.public ? (
              <Globe className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            {iStudyGroupCard.public ? "Public" : "Private"}
          </Badge>
        )}
      </div>

      {/* Description */}
      {iStudyGroupCard.description && (
        <CardDescription
          className="mt-2 line-clamp-3 text-gray-600 text-sm dark:text-gray-300"
          title={iStudyGroupCard.description}
        >
          {iStudyGroupCard.description}
        </CardDescription>
      )}

      {/* Footer: Members & Progress */}
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between text-gray-600 text-sm dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">
              {iStudyGroupCard.memberCount} / {iStudyGroupCard.memberLimit}
            </span>
          </div>
          {!roleHidden && <CheckRole ownerId={iStudyGroupCard.ownerId} />}
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-zinc-700">
          <div
            className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
