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
import { MessageCircle, PlusCircle } from "lucide-react";
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
    <Card className="border-0 bg-gradient-to-br shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 font-bold text-base text-blue-700">
            <MessageCircle className="h-6 w-6 text-blue-500" />
            Channel Group Chat
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Exchange, Q&A, and share in your study group
          </CardDescription>
        </div>
        <Button
          className="ml-auto flex items-center gap-1 border-blue-400 text-blue-700 hover:bg-blue-50"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Create Channel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading && (
            <div className="text-center text-muted-foreground text-sm">
              Loading chat channels...
            </div>
          )}
          {isError && (
            <div className="text-center text-red-500 text-sm">
              {(error as Error)?.message || "Lỗi tải kênh chat."}
            </div>
          )}
          {!isLoading && !isError && channels.length === 0 && (
            <div className="text-center text-muted-foreground text-sm">
              No chat channels yet.
            </div>
          )}
          {channels.map((channel) => (
            <button
              type="button"
              onClick={() => onClick(channel.id, channel.name)}
              key={channel.id}
              className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-white/80 px-4 py-3 shadow-sm transition hover:bg-blue-50/80 focus:outline-none"
              style={{ boxShadow: "0 2px 8px #dbeafe55" }}
            >
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-blue-200">
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
                  <p className="font-semibold text-blue-800">{channel.name}</p>
                  <p className="max-w-[180px] truncate text-gray-500 text-xs">
                    New messages:{" "}
                    <span className="font-medium text-gray-700">
                      {channel.lastMessage || "No messages yet"}
                    </span>
                  </p>
                </div>
              </div>
              <span className="min-w-[80px] text-right font-medium text-blue-500 text-xs">
                {channel.time
                  ? formatDistanceToNow(parseISO(channel.time), {
                      addSuffix: true,
                    })
                  : ""}
              </span>
            </button>
          ))}
        </div>
      </CardContent>

      {/* Dialog tạo kênh chat */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-blue-700">
              Create New Chat Channel
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter chat channel name..."
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            autoFocus
            className="border-blue-300 focus:ring-blue-400"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!channelName.trim() || createChannel.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {createChannel.isPending ? "Đang tạo..." : "Tạo kênh"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
