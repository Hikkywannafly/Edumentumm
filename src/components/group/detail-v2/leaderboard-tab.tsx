import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChannel } from "@/hooks/chat/use-channel";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

interface ChatChannelTabProps {
  groupId?: string;
  onClick: (channelId: string, name: string) => void;
}

export function ChatChannelTab({ groupId, onClick }: ChatChannelTabProps) {
  const [open, setOpen] = useState(false);
  const [channelName, setChannelName] = useState("");

  const { channels, isLoading, isError, error, createChannel } =
    useChannel(groupId);

  const handleCreate = () => {
    if (!channelName.trim()) return;
    createChannel.mutate(channelName.trim(), {
      onSuccess: () => {
        setOpen(false);
        setChannelName("");
      },
      onError: (err: any) => {
        alert(err?.message || "Create channel error");
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 font-semibold text-sm">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Kênh trò chuyện nhóm
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Trao đổi, hỏi đáp và chia sẻ trong nhóm học tập của bạn
          </CardDescription>
        </div>
        <Button
          className="ml-auto"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          + Tạo kênh chat
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading && (
            <div className="text-center text-muted-foreground text-sm">
              Đang tải kênh chat...
            </div>
          )}
          {isError && (
            <div className="text-center text-red-500 text-sm">
              {(error as Error)?.message || "Lỗi tải kênh chat."}
            </div>
          )}
          {!isLoading && !isError && channels.length === 0 && (
            <div className="text-center text-muted-foreground text-sm">
              Chưa có kênh chat nào.
            </div>
          )}
          {channels.map((channel) => (
            <div
              onClick={() => onClick(channel.id, channel.name)}
              key={channel.id}
              className="flex items-center justify-between rounded-md border bg-card px-4 py-3 transition hover:bg-muted/50"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {channel.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{channel.name}</p>
                  <p className="max-w-[180px] truncate text-muted-foreground text-xs">
                    Tin nhắn mới nhất :{" "}
                    {channel.lastMessage || "Chưa có tin nhắn"}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground text-xs">
                {channel.time
                  ? formatDistanceToNow(parseISO(channel.time), {
                      addSuffix: true,
                      locale: undefined,
                    })
                  : ""}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Dialog tạo kênh chat */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tạo kênh chat mới</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nhập tên kênh chat..."
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!channelName.trim() || createChannel.isPending}
            >
              {createChannel.isPending ? "Đang tạo..." : "Tạo kênh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
