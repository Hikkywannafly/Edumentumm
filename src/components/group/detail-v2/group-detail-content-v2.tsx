"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, LucideSettings, MessageCircle, Store } from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "../../../contexts/auth-context";
import { useDialogState } from "../../../hooks/group/use-dialog";
import { useGroupDetail } from "../../../hooks/group/use-group-detail";
import { usePlan } from "../../../hooks/group/use-plan";
import { LocalizedLink } from "../../localized-link";
import { Button } from "../../ui";
import Chat from "../detail/chat/chat";
import GiftPointsDialog from "../detail/gift-point-dialog";
import GroupSettingsDialog from "../detail/group-settings-dialog";
import { DocumentsTab } from "./documents-tab";
import { LeaderboardTab } from "./leaderboard-tab";
import { MembersTab } from "./members-tab";
import { OverviewCards } from "./overview-cards";
import { PlansTab } from "./plans-tab";
import { ReportsTab } from "./reports-tab";

const STATIC_MEMBERS = [
  {
    id: 1,
    name: "Md Kaiyum Hossain",
    initials: "MK",
    points: "10m",
    rank: 1,
    isOnline: false,
  },
  {
    id: 2,
    name: "alexionesc",
    initials: "AL",
    points: "8m",
    rank: 2,
    isOnline: true,
  },
  {
    id: 3,
    name: "Jane Smith",
    initials: "JS",
    points: "5m",
    rank: 3,
    isOnline: true,
  },
];
const STATIC_PLANS = [
  {
    id: 1,
    title: "Luyện từ vựng THPT tuần 1",
    description: "Học 50 từ vựng cơ bản cho kỳ thi THPT",
    creator: "Md Kaiyum Hossain",
    participants: 8,
    duration: "7 ngày",
    status: "active",
    progress: 65,
    subject: "Tiếng Anh",
    startDate: "2025-08-15",
    endDate: "2025-08-22",
    tasks: [
      {
        id: 1,
        title: "Học từ vựng ngày 1-2 (20 từ)",
        completed: true,
        dueDate: "2025-08-16",
      },
      {
        id: 2,
        title: "Ôn tập từ vựng ngày 1-2",
        completed: true,
        dueDate: "2025-08-17",
      },
      {
        id: 3,
        title: "Học từ vựng ngày 3-4 (15 từ)",
        completed: true,
        dueDate: "2025-08-18",
      },
      {
        id: 4,
        title: "Làm bài tập trắc nghiệm",
        completed: false,
        dueDate: "2025-08-19",
      },
      {
        id: 5,
        title: "Học từ vựng ngày 5-7 (15 từ)",
        completed: false,
        dueDate: "2025-08-21",
      },
      {
        id: 6,
        title: "Kiểm tra tổng kết",
        completed: false,
        dueDate: "2025-08-22",
      },
    ],
    notes:
      "Tập trung vào từ vựng học thuật và từ vựng thường gặp trong đề thi THPT",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Ôn tập Toán - Hàm số",
    description: "Ôn tập chương hàm số lớp 12",
    creator: "alexionesc",
    participants: 12,
    duration: "14 ngày",
    status: "completed",
    progress: 100,
    subject: "Toán",
    startDate: "2025-08-01",
    endDate: "2025-08-15",
    tasks: [
      {
        id: 1,
        title: "Ôn lý thuyết hàm số",
        completed: true,
        dueDate: "2025-08-03",
      },
      {
        id: 2,
        title: "Bài tập tính đơn điệu",
        completed: true,
        dueDate: "2025-08-05",
      },
      {
        id: 3,
        title: "Bài tập cực trị",
        completed: true,
        dueDate: "2025-08-08",
      },
      {
        id: 4,
        title: "Bài tập tiệm cận",
        completed: true,
        dueDate: "2025-08-10",
      },
      { id: 5, title: "Đề thi thử", completed: true, dueDate: "2025-08-15" },
    ],
    notes: "Hoàn thành xuất sắc! Tất cả thành viên đều đạt điểm cao",
    rating: 5.0,
  },
  {
    id: 3,
    title: "Luyện viết văn nghị luận",
    description: "Thực hành viết văn nghị luận xã hội",
    creator: "Jane Smith",
    participants: 5,
    duration: "10 ngày",
    status: "upcoming",
    progress: 0,
    subject: "Văn",
    startDate: "2025-08-25",
    endDate: "2025-09-05",
    tasks: [
      {
        id: 1,
        title: "Học cấu trúc bài văn nghị luận",
        completed: false,
        dueDate: "2025-08-26",
      },
      {
        id: 2,
        title: "Phân tích đề bài mẫu",
        completed: false,
        dueDate: "2025-08-28",
      },
      {
        id: 3,
        title: "Viết bài văn đầu tiên",
        completed: false,
        dueDate: "2025-08-30",
      },
      {
        id: 4,
        title: "Nhận xét và sửa bài",
        completed: false,
        dueDate: "2025-09-02",
      },
      {
        id: 5,
        title: "Viết bài văn hoàn chỉnh",
        completed: false,
        dueDate: "2025-09-05",
      },
    ],
    notes: "Sẽ bắt đầu vào tuần tới. Chuẩn bị tài liệu tham khảo",
    rating: 0,
  },
];
const STATIC_REPORTS = [
  {
    date: "2025-08-01",
    content: "Có 10 thành viên mới tham gia trong tháng 7.",
  },
  {
    date: "2025-08-10",
    content: "Tổ chức buổi học online vào thứ 7 tuần này.",
  },
];
const STATIC_REMINDERS = [
  "Không spam quảng cáo.",
  "Giữ thái độ tôn trọng khi tham gia thảo luận.",
];

export default function GroupDetailContentV2({ id }: { id: string }) {
  const { user } = useAuth();
  const { dialogState, toggleDialog } = useDialogState();
  const { expandedPlan, togglePlanExpansion } = usePlan();
  const { groupDetail, handleGroupUpdate } = useGroupDetail(id);

  const groupSettings = useMemo(
    () => ({
      id: groupDetail?.id ?? 0,
      name: groupDetail?.name ?? "",
      description: groupDetail?.description ?? "",
      memberLimit: groupDetail?.memberLimit ?? 0,
      public: groupDetail?.isPublic ?? false,
    }),
    [groupDetail],
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Dialogs */}
      <GiftPointsDialog
        groupId={groupDetail?.id}
        maxPoints={1000}
        open={dialogState.gifts}
        onClose={() => toggleDialog("gifts")}
        onGiftSubmit={() => {}}
      />

      <GroupSettingsDialog
        open={dialogState.settings}
        onClose={() => toggleDialog("settings")}
        group={groupSettings}
        onGroupUpdate={handleGroupUpdate}
      />

      {/* Chat Button */}
      <div className="fixed right-6 bottom-6 z-50">
        {dialogState.chat ? (
          <Chat
            currentUserId={Number(user?.userId)}
            currentUserName={user?.username}
            roomId={id}
            currentUserAvatar="https://tse4.mm.bing.net/th/id/OIP.ep74te1OIN1PMqHDf65LDwHaNK?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3"
            setClose={() => toggleDialog("chat")}
          />
        ) : (
          <Button
            onClick={() => toggleDialog("chat")}
            className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700"
          >
            <MessageCircle size={20} />
          </Button>
        )}
      </div>

      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:gap-1">
            <h1 className="font-extrabold text-3xl text-indigo-800 tracking-tight dark:text-indigo-400">
              {groupDetail?.name}
            </h1>
            <p className="max-w-xl text-gray-700 text-sm sm:text-base dark:text-gray-300">
              {groupDetail?.description}
            </p>
            <div className="mt-1 h-[2px] w-20 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => toggleDialog("gifts")}
              variant="outline"
              className="hover:bg-indigo-50 dark:hover:bg-zinc-800"
            >
              <Gift className="h-4 w-4" />
            </Button>
            <LocalizedLink href={`/group/${id}/store`}>
              <Button
                variant="outline"
                className="flex items-center gap-1 hover:bg-indigo-50 dark:hover:bg-zinc-800"
              >
                <Store className="h-4 w-4" /> Kho lưu trữ
              </Button>
            </LocalizedLink>
            {user?.userId === groupDetail?.ownerId && (
              <Button
                onClick={() => toggleDialog("settings")}
                aria-label="Cài đặt nhóm"
                className="hover:bg-gray-400 dark:hover:bg-zinc-800"
              >
                <LucideSettings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Overview Cards */}
        <OverviewCards
          groupTier={groupDetail?.groupTier}
          keyG={groupDetail?.key}
          memberCount={groupDetail?.memberCount}
          memberLimit={groupDetail?.memberLimit}
          contributionPoints={groupDetail?.contributionPoints}
        />

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-lg bg-gray-100 dark:bg-zinc-800">
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="leaderboard" className="space-y-4">
              <LeaderboardTab members={STATIC_MEMBERS} />
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <MembersTab members={groupDetail?.userGroupResponseList} />
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <PlansTab
                plans={STATIC_PLANS}
                expandedPlan={expandedPlan}
                onTogglePlanExpansion={togglePlanExpansion}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <DocumentsTab />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <ReportsTab
                reports={STATIC_REPORTS}
                reminders={STATIC_REMINDERS}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
