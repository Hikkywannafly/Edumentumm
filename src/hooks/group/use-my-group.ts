import { useCallback, useEffect, useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse } from "../../types/group";

interface UseMyGroupsReturn {
  myGroups: GroupResponse[];
  isLoading: boolean;
  error: Error | null;
  addGroup: (group: GroupResponse) => void;
  removeGroup: (groupId: number) => void;
  refreshGroups: () => Promise<void>;
}

export function useMyGroups(): UseMyGroupsReturn {
  const [myGroups, setMyGroups] = useState<GroupResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMyGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await groupAPI.getMyGroups();
      setMyGroups(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch my groups"),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyGroups();
  }, [fetchMyGroups]);

  const addGroup = useCallback((group: GroupResponse) => {
    setMyGroups((prev) => [...prev, group]);
  }, []);

  const removeGroup = useCallback((groupId: number) => {
    setMyGroups((prev) => prev.filter((group) => group.id !== groupId));
  }, []);

  const refreshGroups = useCallback(async () => {
    await fetchMyGroups();
  }, [fetchMyGroups]);

  return {
    myGroups,
    isLoading,
    error,
    addGroup,
    removeGroup,
    refreshGroups,
  };
}
