"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyGroups } from "@/hooks/group";
import { Play, Users } from "lucide-react";
import { LocalizedLink } from "../localized-link";

interface StudyGroup {
  id: string;
  name: string;
  onlineCount: number; // Actually represents memberCount, keeping same name for compatibility
}

interface StudyGroupsActivityProps {
  studyGroups?: StudyGroup[];
}

export default function StudyGroupsActivity({
  studyGroups = [
    { id: "1", name: "Mockup", onlineCount: 5 },
    { id: "2", name: "Study Mock", onlineCount: 12 },
  ],
}: StudyGroupsActivityProps) {
  const {
    myGroups,
    isLoading: myGroupsLoading,
    error: myGroupsError,
  } = useMyGroups();

  // Map GroupResponse to StudyGroup format
  const mappedGroups = myGroups.map((group) => ({
    id: group.publicId,
    name: group.name,
    onlineCount: group.memberCount,
  }));

  // Use real data if available, fallback to mock data
  const displayGroups = mappedGroups.length > 0 ? mappedGroups : studyGroups;

  // Show loading state
  if (myGroupsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Study Groups Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">
              Loading your groups...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (myGroupsError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Study Groups Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500 text-sm">Failed to load groups</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Study Groups Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayGroups.length > 0 ? (
          displayGroups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{group.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    <Users className="mr-1 inline h-3 w-3" />
                    {group.onlineCount} members
                  </p>
                </div>
              </div>
              {/* Check if this is a real group (has proper ID format) to determine if we should link */}
              {group.id.length > 5 ? (
                <LocalizedLink href={`/group/${group.id}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Play className="h-4 w-4" />
                    Join
                  </Button>
                </LocalizedLink>
              ) : (
                <Button variant="ghost" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Join
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground text-sm">
              No groups joined yet
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
