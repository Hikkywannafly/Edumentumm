"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface GiftPointsDialogProps {
  open: boolean;
  onClose: () => void;
  publicId?: string;
  maxPoints: number;
  onGiftSubmit?: (payload: {
    points: number;
    publicId?: string;
    message: string;
  }) => void;
}

export default function GiftPointsDialog({
  open,
  onClose,
  publicId,
  maxPoints = 100,
  onGiftSubmit,
}: GiftPointsDialogProps) {
  const [points, setPoints] = useState(Math.floor(maxPoints / 2));
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    onGiftSubmit?.({ points, publicId, message });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Đóng góp điểm cho nhóm</DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p>Số điểm: {points}</p>
            <input
              type="range"
              min={0}
              max={maxPoints}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p>Lời nhắn</p>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-md border p-2"
              placeholder="Viết lời nhắn cho nhóm..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
            </DialogClose>
            <Button onClick={handleSubmit}>Gửi điểm</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
