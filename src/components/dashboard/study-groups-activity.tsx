"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyGroups } from "@/hooks/group";
import { Play, Plus, UserPlus, Users } from "lucide-react";
import { LocalizedLink } from "../localized-link";

export default function StudyGroupsActivity() {
  const {
    myGroups,
    isLoading: myGroupsLoading,
    error: myGroupsError,
  } = useMyGroups();

  const mappedGroups = myGroups.map((group) => ({
    id: group.publicId,
    name: group.name,
    onlineCount: group.memberCount,
  }));

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
        {mappedGroups.length > 0 ? (
          mappedGroups.map((group) => (
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
              <LocalizedLink href={`/group/${group.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Join
                </Button>
              </LocalizedLink>
            </div>
          ))
        ) : (
          <div className="space-y-4 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">No study groups yet</h3>
              <p className="text-muted-foreground text-sm">
                Join or create study groups to collaborate with other learners
                and boost your productivity!
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="default" asChild>
                <LocalizedLink href="/group">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Explore Groups
                </LocalizedLink>
              </Button>
              <Button variant="outline" asChild>
                <LocalizedLink href="/group/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </LocalizedLink>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
