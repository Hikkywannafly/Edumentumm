import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "../../lib/api/group";
import type { GroupDetailResponse } from "../../types/group";

export function useGroupDetail(publicId: string) {
  const queryClient = useQueryClient();

  const {
    data: groupDetail,
    isLoading,
    error,
  } = useQuery<GroupDetailResponse, Error>({
    queryKey: ["groupDetail", publicId],
    queryFn: () => groupAPI.getGroupDetailById(publicId),
    enabled: !!publicId,
  });

  const handleGroupUpdate = (updated: Partial<GroupDetailResponse>) => {
    queryClient.setQueryData<GroupDetailResponse>(
      ["groupDetail", publicId],
      (prev) =>
        prev
          ? {
              ...prev,
              ...updated,
              ownerId: prev.ownerId,
            }
          : prev,
    );
  };

  return {
    groupDetail,
    isLoading,
    error,
    handleGroupUpdate,
  };
}
