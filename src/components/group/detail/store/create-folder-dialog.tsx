"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { folderAPI } from "../../../../lib/api/folder";
import type { FolderResponse } from "../../../../types/folder";

interface CreateFolderDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newFolder: FolderResponse) => void;
}

export function CreateFolderDialog({
  groupId,
  open,
  onOpenChange,
  onSuccess,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      setLoading(true);
      const newFolder = await folderAPI.createFolder(groupId, name.trim());
      console.log(newFolder);
      onSuccess?.(newFolder);
      onOpenChange(false);
      setName("");
      toast.success("Create folder successfully!");
    } catch (err) {
      console.error("Error creating folder:", err);
      toast.error("Failed to create folder!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <DialogTitle className="font-medium text-base">
              Tạo thư mục
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Tên thư mục</Label>
            <Input
              id="folder-name"
              placeholder="Nhập tên thư mục..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg"
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
