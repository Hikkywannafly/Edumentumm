"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeyRound, Plus, Search } from "lucide-react";
import { Grid, List } from "lucide-react";
import { useState } from "react";
import { useMyGroups, usePublicGroups } from "../../hooks/group";
import type { GroupResponse } from "../../types/group";
import { LocalizedLink } from "../localized-link";
import GroupDialog from "./group-dialog";
import GroupPaging from "./group-paging";
import { StudyGroupCard } from "./study-group-card";
import { StudyGroupCardSkeleton } from "./study-group-card-skeleton";

export default function GroupContent() {
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(
    null,
  );
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const pageSize = 8;

  const { myGroups, isLoading: myGroupsLoading, addGroup } = useMyGroups();

  const {
    groups,
    paging,
    isLoading: groupsLoading,
    keyword,
    setKeyword,
    setPage,
    removeGroup,
  } = usePublicGroups(pageSize);

  const renderGroupList = (
    list: GroupResponse[],
    isMyGroup: boolean,
    onClick?: (group: GroupResponse) => void,
  ) =>
    list.length > 0 ? (
      list.map((group) => (
        <div key={group.publicId}>
          {isMyGroup ? (
            <LocalizedLink href={`/group/${group.publicId}`}>
              <StudyGroupCard
                publicHidden={false}
                roleHidden={false}
                iStudyGroupCard={group}
              />
            </LocalizedLink>
          ) : (
            <StudyGroupCard
              publicHidden
              roleHidden
              iStudyGroupCard={group}
              onClick={onClick ? () => onClick(group) : undefined}
            />
          )}
        </div>
      ))
    ) : (
      <div className="col-span-full flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 py-16 shadow-inner">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Plus className="h-8 w-8 text-blue-500" />
        </div>
        <h3 className="mb-2 font-bold text-blue-700 text-xl">
          Chưa có nhóm học nào
        </h3>
        <p className="mb-4 max-w-xs text-center text-gray-500">
          Bạn chưa tham gia hoặc tạo nhóm học nào. Hãy bắt đầu bằng cách tạo
          nhóm mới hoặc tham gia nhóm với mã!
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <KeyRound className="h-4 w-4" /> Tham gia với mã
          </Button>
          <LocalizedLink href="group/create">
            <Button className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Tạo nhóm mới
            </Button>
          </LocalizedLink>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div>
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            Study Groups
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create or join study groups to compete and learn together with
            friends.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <KeyRound className="h-4 w-4" /> Join with Code
          </Button>
          <LocalizedLink href="group/create">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Create Group
            </Button>
          </LocalizedLink>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          My Groups
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myGroupsLoading ? (
            <>
              <StudyGroupCardSkeleton />
              <StudyGroupCardSkeleton />
              <StudyGroupCardSkeleton />
              <StudyGroupCardSkeleton />
            </>
          ) : (
            renderGroupList(myGroups, true)
          )}
        </div>
      </section>
      <section>
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          Discover Groups
        </h2>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Tên A-Z</SelectItem>
                <SelectItem value="date">Ngày tạo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1 bg-gray-200">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {paging && paging.totalElements > 8 && (
          <div className="mb-4 flex-shrink-0">
            <GroupPaging pagination={paging} pageIndex={setPage} />
          </div>
        )}

        {groupsLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <>
              <StudyGroupCardSkeleton />
              <StudyGroupCardSkeleton />
              <StudyGroupCardSkeleton />
              <StudyGroupCardSkeleton />
            </>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {renderGroupList(groups, false, setSelectedGroup)}
          </div>
        )}
      </section>

      <GroupDialog
        selectedGroup={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onJoinSuccess={(group) => {
          addGroup(group);
          removeGroup(group.publicId);
        }}
      />
    </div>
  );
}
