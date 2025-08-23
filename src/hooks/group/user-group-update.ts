import { useState } from "react";
import { toast } from "sonner";
import { groupAPI } from "../../lib/api/group";
import type { UpdateStudyGroupFormData } from "../../lib/schemas/group";
import { useLocalizedNavigation } from "../../lib/utils/navigation";

interface UseUpdateGroupProps {
  onClose: () => void;
  onGroupUpdate?: (updated: UpdateStudyGroupFormData) => void;
  onGroupDelete?: (id: number) => void;
}

export function useUpdateGroup({
  onClose,
  onGroupUpdate,
  onGroupDelete,
}: UseUpdateGroupProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { goGroup } = useLocalizedNavigation();

  const handleUpdate = async (data: UpdateStudyGroupFormData) => {
    try {
      const updated = await groupAPI.updateGroup(data, String(data.id));
      if (!updated) throw new Error("API returned invalid group data");
      onGroupUpdate?.(updated);
      toast.success("Cập nhật nhóm thành công.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? `Cập nhật thất bại: ${err.message}`
          : "Cập nhật thất bại",
      );
    }
  };

  const handleDelete = async (groupId: number) => {
    try {
      await groupAPI.deleteGroup(groupId);
      toast.success("Đã xóa nhóm thành công.");
      onGroupDelete?.(groupId);
      onClose();
      goGroup();
    } catch (err) {
      console.error(err);
      toast.error("Xóa nhóm thất bại.");
    }
  };

  return {
    confirmDelete,
    setConfirmDelete,
    handleUpdate,
    handleDelete,
  };
}
