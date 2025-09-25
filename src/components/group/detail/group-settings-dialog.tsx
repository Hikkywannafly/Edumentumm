"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateGroup } from "../../../hooks/group/use-update-group";
import { updateStudyGroupSchema } from "../../../lib/schemas/group";
import type { UpdateStudyGroupFormData } from "../../../lib/schemas/group";

interface GroupSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  group: UpdateStudyGroupFormData;
  onGroupUpdate?: (updated: UpdateStudyGroupFormData) => void;
  onGroupDelete?: (publicId: string) => void;
}

export default function GroupSettingsDialog({
  open,
  onClose,
  group,
  onGroupUpdate,
  onGroupDelete,
}: GroupSettingsDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateStudyGroupFormData>({
    resolver: zodResolver(updateStudyGroupSchema),
    defaultValues: group,
  });

  const { confirmDelete, setConfirmDelete, updateMutation, deleteMutation } =
    useUpdateGroup({
      id: group.publicId,
      onClose,
      onGroupUpdate,
      onGroupDelete,
    });

  const handleUpdate = (data: UpdateStudyGroupFormData) => {
    updateMutation.mutate(data);
  };

  const handleDelete = (confirm: boolean) => {
    if (confirm) {
      deleteMutation.mutate(group.publicId);
    }
  };

  useEffect(() => {
    if (open) {
      reset(group);
    }
  }, [group, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="space-y-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-semibold text-lg">
            Cập nhật thông tin nhóm
          </DialogTitle>
          <DialogDescription>
            Chỉnh sửa tên, mô tả, giới hạn thành viên hoặc xóa nhóm.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleUpdate)}
          className="flex flex-col gap-4"
        >
          <input type="hidden" {...register("publicId")} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Tên nhóm</Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
              placeholder="Nhập tên nhóm"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">
                {errors.name.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Mô tả nhóm</Label>
            <Textarea
              id="description"
              rows={3}
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
              placeholder="Nhập mô tả..."
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="memberLimit">Số lượng thành viên</Label>
            <Input
              id="memberLimit"
              type="number"
              {...register("memberLimit", { valueAsNumber: true })}
              className={errors.memberLimit ? "border-red-500" : ""}
              placeholder="Ví dụ: 100"
            />
            {errors.memberLimit && (
              <span className="text-red-500 text-sm">
                {errors.memberLimit.message}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="public"
              type="checkbox"
              {...register("public")}
              className="rounded border-gray-300"
            />
            <Label htmlFor="public">Công khai nhóm</Label>
          </div>

          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="mr-1 h-4 w-4" />
                Hủy
              </Button>
            </DialogClose>
            <Button type="submit">
              <Save className="mr-1 h-4 w-4" />
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>

        {/* Delete group card */}
        <Card className="border-red-300 bg-red-50 p-4">
          {!confirmDelete ? (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Xóa nhóm
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-red-600 text-sm">
                Bạn có chắc chắn muốn xóa nhóm này? Hành động không thể hoàn
                tác.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDelete(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDelete(true)}
                >
                  Xác nhận xóa
                </Button>
              </div>
            </div>
          )}
        </Card>
      </DialogContent>
    </Dialog>
  );
}
