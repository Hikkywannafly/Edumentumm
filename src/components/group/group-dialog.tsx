"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Globe, Lock, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";

interface GroupDialogProps {
  selectedGroup: GroupResponse | null;
  onClose: () => void;
  onJoinSuccess: (group: GroupResponse) => void;
}

export default function GroupDialog({
  selectedGroup,
  onClose,
  onJoinSuccess,
}: GroupDialogProps) {
  const [joinLoading, setJoinLoading] = useState(false);

  const handleJoinGroup = async () => {
    if (!selectedGroup) return;
    setJoinLoading(true);
    try {
      await groupAPI.joinGroup(selectedGroup.publicId);
      onJoinSuccess(selectedGroup);
      toast.success("Tham gia nhóm thành công!");
      onClose();
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <Dialog open={!!selectedGroup} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogContent className="flex max-h-[85vh] flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 text-foreground shadow-xl sm:max-w-sm dark:border-zinc-700 dark:from-zinc-900 dark:to-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold text-xl leading-tight">
            {selectedGroup?.name}
            {selectedGroup?.public ? (
              <Globe className="h-5 w-5 text-green-500" />
            ) : (
              <Lock className="h-5 w-5 text-red-500" />
            )}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="mt-2 line-clamp-4 text-muted-foreground text-sm leading-relaxed">
          {selectedGroup?.description || "No description available."}
        </DialogDescription>

        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-sm">
          <Users className="h-4 w-4" />
          <span>{selectedGroup?.memberCount}/50 members</span>
        </div>

        <DialogFooter className="mt-auto pt-6">
          <Button
            onClick={handleJoinGroup}
            disabled={joinLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 font-medium text-sm text-white shadow-md hover:from-blue-600 hover:to-indigo-600"
          >
            {joinLoading ? "Requesting..." : "Request to Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
