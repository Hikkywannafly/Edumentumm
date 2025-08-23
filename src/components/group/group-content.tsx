"use client";

import { Button } from "@/components/ui/button";
import { KeyRound, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useMyGroups, usePublicGroups } from "../../hooks/group";
import type { GroupResponse } from "../../types/group";
import { LocalizedLink } from "../localized-link";
import GroupDialog from "./group-dialog";
import GroupPaging from "./group-paging";
import { StudyGroupCard } from "./study-group-card";

export default function GroupContent() {
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(
    null,
  );
  const pageSize = 8;

  const {
    myGroups,
    isLoading: myGroupsLoading,
    error: myGroupsError,
    addGroup,
  } = useMyGroups();

  const {
    groups,
    paging,
    isLoading: groupsLoading,
    error: groupsError,
    keyword,
    setKeyword,
    setPage,
    isSearching,
    removeGroup,
  } = usePublicGroups(pageSize);

  const renderGroupList = (
    list: GroupResponse[],
    isMyGroup: boolean,
    onClick?: (group: GroupResponse) => void,
  ) =>
    list.length > 0 ? (
      list.map((group) => (
        <div key={group.id}>
          {isMyGroup ? (
            <LocalizedLink href={`/group/${group.id}`}>
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
      <div className="py-10 text-center text-gray-500 dark:text-gray-400">
        Không có dữ liệu
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
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

      {/* My Groups */}
      <section className="mb-10">
        <h2 className="mb-4 font-semibold text-foreground text-xl">
          My Groups
        </h2>
        {myGroupsError && (
          <div className="mb-4 text-red-500">{myGroupsError.message}</div>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {myGroupsLoading ? (
            <div className="col-span-full flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            renderGroupList(myGroups, true)
          )}
        </div>
      </section>

      {/* Discover Groups */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-col sm:justify-between">
          <h2 className="font-semibold text-foreground text-xl">
            Discover Groups
          </h2>
          <div className="relative w-full sm:w-180">
            <Search
              className={`absolute top-2.5 left-3 h-4 w-4 ${
                isSearching ? "animate-pulse text-blue-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search groups..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
            {isSearching && (
              <span className="absolute top-2.5 right-3 text-muted-foreground text-xs">
                Searching...
              </span>
            )}
          </div>
        </div>

        {groupsError && (
          <div className="mb-4 text-red-500">{groupsError.message}</div>
        )}

        {groupsLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {renderGroupList(groups, false, setSelectedGroup)}
          </div>
        )}
      </section>

      <div className="mt-8">
        <GroupPaging pagination={paging} pageIndex={setPage} />
      </div>

      {/* Dialog */}
      <GroupDialog
        selectedGroup={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onJoinSuccess={(group) => {
          addGroup(group);
          removeGroup(group.id);
        }}
      />
    </div>
  );
}
