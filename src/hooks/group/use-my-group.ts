import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";

export function useMyGroups() {
  const queryClient = useQueryClient();

  const {
    data: myGroups = [],
    isLoading,
    error,
    refetch,
  } = useQuery<GroupResponse[], Error>({
    queryKey: ["myGroups"],
    queryFn: async () => {
      try {
        return await groupAPI.getMyGroups();
      } catch (err) {
        throw err instanceof Error
          ? err
          : new Error("Failed to fetch my groups");
      }
    },
  });

  const addGroup = (group: GroupResponse) => {
    queryClient.setQueryData<GroupResponse[]>(["myGroups"], (old) =>
      old ? [...old, group] : [group],
    );
  };

  const removeGroup = (groupId: number) => {
    queryClient.setQueryData<GroupResponse[]>(["myGroups"], (old) =>
      old ? old.filter((g) => g.id !== groupId) : [],
    );
  };

  const refreshGroups = async () => {
    await refetch();
  };

  return {
    myGroups,
    isLoading,
    error,
    addGroup,
    removeGroup,
    refreshGroups,
  };
}
