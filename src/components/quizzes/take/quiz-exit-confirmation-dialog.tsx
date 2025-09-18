"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuizExitConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function QuizExitConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: QuizExitConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to exit?</DialogTitle>
          <DialogDescription>
            Your progress will be saved and you can resume later. Do you want to
            exit the quiz?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onConfirm}>
            Exit Quiz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
