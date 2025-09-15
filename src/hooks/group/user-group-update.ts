import { useState } from "react";
import { toast } from "sonner";
import { groupAPI } from "../../lib/api/group";
import type { UpdateStudyGroupFormData } from "../../lib/schemas/group";
import { useLocalizedNavigation } from "../../lib/utils/navigation";

interface UseUpdateGroupProps {
  onClose: () => void;
  onGroupUpdate?: (updated: UpdateStudyGroupFormData) => void;
  onGroupDelete?: (id: string) => void;
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
      const updated = await groupAPI.updateGroup(data, data.publicId);
      if (!updated) throw new Error("API returned invalid group data");
      onGroupUpdate?.(updated);
      toast.success("Group updated successfully.");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error
          ? `Update failed: ${err.message}`
          : "Update failed",
      );
    }
  };

  const handleDelete = async (groupId: string) => {
    try {
      await groupAPI.deleteGroup(groupId);
      toast.success("Group deleted successfully.");
      onGroupDelete?.(groupId);
      onClose();
      goGroup();
    } catch (err) {
      console.error(err);
      toast.error("Group deletion failed.");
    }
  };

  return {
    confirmDelete,
    setConfirmDelete,
    handleUpdate,
    handleDelete,
  };
}
