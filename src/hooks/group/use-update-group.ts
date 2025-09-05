import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { groupAPI } from "../../lib/api/group";
import type { UpdateStudyGroupFormData } from "../../lib/schemas/group";
import { useLocalizedNavigation } from "../../lib/utils/navigation";

interface UseUpdateGroupProps {
  id: string | number;
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
  const queryClient = useQueryClient();
  const { goGroup } = useLocalizedNavigation();

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateStudyGroupFormData) =>
      groupAPI.updateGroup(data, String(data.id)),
    onSuccess: (updated) => {
      if (!updated) {
        toast.error("API returned invalid group data");
        return;
      }
      onGroupUpdate?.(updated);
      toast.success("Update group successful.");
      onClose();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(
        err instanceof Error
          ? `Update failed: ${err.message}`
          : "Update failed",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (groupId: number) => groupAPI.deleteGroup(groupId),
    onSuccess: (_, groupId) => {
      toast.success("Group deleted successfully.");
      onGroupDelete?.(groupId);
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      queryClient.removeQueries({ queryKey: ["groupDetail", groupId] });

      onClose();
      goGroup();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Group deletion failed.");
    },
  });

  return {
    confirmDelete,
    setConfirmDelete,
    updateMutation,
    deleteMutation,
  };
}
