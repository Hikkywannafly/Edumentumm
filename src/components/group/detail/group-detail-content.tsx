"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArchiveRestoreIcon,
  Code,
  Download,
  Eye,
  FileText,
  MessageCircle,
  StarIcon,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/auth-context";
import { groupAPI } from "../../../lib/api/group";
import type { GroupDetailResponse } from "../../../types/group";
import Chat from "./chat/chat";
import GiftPointsDialog from "./gift-point-dialog";
import GroupHeader from "./group-header";
import GroupSettingsDialog from "./group-settings-dialog";
import JoinCodeCard from "./join-code-card";
import GroupNoteCard from "./live-activity-card";
import StatsCard from "./stats-card";

export default function GroupDetailContent({ id }: { id: string }) {
  const [groupDetail, setGroupDetail] = useState<GroupDetailResponse | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGiftsOpen, setisGiftsOpen] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [group] = await Promise.all([
          groupAPI.getGroupDetailById(Number(id)),
        ]);
        setGroupDetail(group);
        console.log("Group detail fetched successfully:", group);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [id]);

  const { user } = useAuth();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="fixed right-6 bottom-6 z-50">
        {open && (
          <Chat
            currentUserId={Number(user?.userId)}
            currentUserName={user?.username}
            roomId={id}
            currentUserAvatar={
              "https://tse4.mm.bing.net/th/id/OIP.ep74te1OIN1PMqHDf65LDwHaNK?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"
            }
            setClose={() => setOpen(false)}
          />
        )}
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg"
          >
            <MessageCircle size={12} />
          </button>
        )}
      </div>
      <div className="mx-auto max-w-6xl space-y-6">
        <GroupHeader
          id={groupDetail?.id}
          name={groupDetail?.name}
          description={groupDetail?.description}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenGift={() => {
            setisGiftsOpen(true);
          }}
        />

        <GiftPointsDialog
          groupId={groupDetail?.id}
          maxPoints={1000}
          open={isGiftsOpen}
          onClose={() => setisGiftsOpen(false)}
          onGiftSubmit={() => {}}
        />

        <GroupSettingsDialog
          open={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          group={{
            id: groupDetail?.id ?? 0,
            name: groupDetail?.name ?? "",
            description: groupDetail?.description ?? "",
            memberLimit: groupDetail?.memberLimit ?? 0,
            public: groupDetail?.isPublic ?? false,
          }}
          onGroupUpdate={(updated) =>
            setGroupDetail((prev) => (prev ? { ...prev, ...updated } : prev))
          }
        />

        <div className="grid gap-6">
          <GroupNoteCard />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatsCard
              title="Members"
              icon={<Users className="h-4 w-4 text-gray-500" />}
              value={`${groupDetail?.memberCount}/${groupDetail?.memberLimit}`}
              description="Created 8/10/2025"
            />
            <JoinCodeCard code={groupDetail?.key} />
            <StatsCard
              title="Điểm đóng góp"
              icon={<ArchiveRestoreIcon className="h-5 w-5 text-gray-500" />}
              value="10.230"
              description={
                <div className="flex items-center gap-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text font-bold text-lg text-transparent">
                    Legend
                  </span>
                </div>
              }
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Tabs defaultValue="leaderboard" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger
                  value="leaderboard"
                  className="flex items-center gap-2"
                >
                  <Trophy className="h-4 w-4" /> Leaderboard
                </TabsTrigger>
                <TabsTrigger
                  value="members"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" /> Members
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Documents
                </TabsTrigger>
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code className="h-4 w-4" /> Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Leaderboard
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  See who&apos;s leading in your study group
                </p>
                <div className="mb-4 flex items-center justify-between">
                  <Tabs defaultValue="current-period" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="current-period">
                        Current Period
                      </TabsTrigger>
                      <TabsTrigger value="all-time">All Time</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=100&width=100"
                          alt="Avatar"
                        />
                        <AvatarFallback>MK</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Md Kaiyum Hossain</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          10m
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                      <Zap className="mr-1 h-3 w-3" /> Top 1
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-gray-500 text-lg dark:text-gray-400">
                        2
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=100&width=100"
                          alt="Avatar"
                        />
                        <AvatarFallback>AL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">alexionesc</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          8m
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Zap className="mr-1 h-3 w-3" /> Top 2
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-gray-500 text-lg dark:text-gray-400">
                        3
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/placeholder.svg?height=100&width=100"
                          alt="Avatar"
                        />
                        <AvatarFallback>JS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Jane Smith</p>
                        <p className="text-gray-500 text-sm dark:text-gray-400">
                          5m
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Zap className="mr-1 h-3 w-3" /> Top 3
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="members" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Group Members
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  List of all members in this study group.
                </p>
                <div className="space-y-3">
                  {groupDetail?.userGroupResponseList.map((member, index) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src="https://i.scdn.co/image/ab6761610000e5ebba2fd1834e1f4e2069e7b738"
                            alt="Avatar"
                          />
                          <AvatarFallback>MK</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.username}</p>
                          <p className="text-green-500 text-sm dark:text-white">
                            Online
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          View Profile
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Shared Documents
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  Important notes, study guides, and resources.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Calculus I - Cheat Sheet.pdf
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Md Kaiyum Hossain - 2 days ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Physics II - Problem Set 3.docx
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by alexionesc - 1 week ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="font-medium">
                        Group Project - Brainstorming.txt
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Jane Smith - 3 weeks ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <CardTitle className="mb-2 font-semibold text-lg">
                  Shared Code Snippets
                </CardTitle>
                <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
                  Code examples, solutions, and project files.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <Code className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium">
                        Python - Quick Sort Algorithm.py
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Md Kaiyum Hossain - 4 days ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View code"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <Code className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium">
                        JavaScript - React Component Example.jsx
                      </p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by alexionesc - 1 week ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View code"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg p-3">
                    <Code className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="font-medium">SQL - Database Schema.sql</p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">
                        Uploaded by Jane Smith - 2 weeks ago
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="View code"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Download code"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
