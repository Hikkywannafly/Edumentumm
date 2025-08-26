import { groupAPI } from "@/lib/api/group";
import type { GroupRequest, GroupResponse } from "@/types/group";
// hooks/useCreateGroup.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation<GroupResponse, Error, GroupRequest>({
    mutationFn: (payload) => groupAPI.createGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
    },
  });
}
