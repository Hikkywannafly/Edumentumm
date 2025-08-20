"use client";

import { Button } from "@/components/ui/button";
import { KeyRound, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";
import { LocalizedLink } from "../localized-link";
import GroupDialog from "./group-dialog";
import { StudyGroupCard } from "./study-group-card";

export default function GroupContent() {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupResponse | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const [allGroups, myGroupsData] = await Promise.all([
        groupAPI.getGroups(),
        groupAPI.getMyGroups(),
      ]);
      setGroups(allGroups);
      setMyGroups(myGroupsData);
    };
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {renderGroupList(myGroups, true)}
        </div>
      </section>

      {/* Discover Groups */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-foreground text-xl">
            Discover Groups
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search groups..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-3 pl-9 text-sm shadow-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {renderGroupList(filteredGroups, false, setSelectedGroup)}
        </div>
      </section>

      {/* Dialog */}
      <GroupDialog
        selectedGroup={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onJoinSuccess={(group) => {
          setMyGroups((prev) => [...prev, group]);
          setGroups((prev) => prev.filter((g) => g.id !== group.id));
        }}
      />
    </div>
  );
}
