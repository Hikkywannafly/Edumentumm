import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "../../lib/api/group";
import type { GroupDetailResponse } from "../../types/group";

export function useGroupDetail(id: string) {
  const queryClient = useQueryClient();

  const {
    data: groupDetail,
    isLoading,
    error,
  } = useQuery<GroupDetailResponse, Error>({
    queryKey: ["groupDetail", id],
    queryFn: () => groupAPI.getGroupDetailById(Number(id)),
    enabled: !!id,
  });

  const handleGroupUpdate = (updated: Partial<GroupDetailResponse>) => {
    queryClient.setQueryData<GroupDetailResponse>(
      ["groupDetail", id],
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
