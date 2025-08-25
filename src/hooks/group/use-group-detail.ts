import { useCallback, useEffect, useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupDetailResponse } from "../../types/group";

export function useGroupDetail(id: string) {
  const [groupDetail, setGroupDetail] = useState<GroupDetailResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleGroupUpdate = useCallback(
    (updated: Partial<GroupDetailResponse>) => {
      setGroupDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          ...updated,
          ownerId: prev.ownerId,
        };
      });
    },
    [],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [group] = await Promise.all([
          groupAPI.getGroupDetailById(Number(id)),
        ]);
        if (isMounted) {
          setGroupDetail(group);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch group detail"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  return {
    groupDetail,
    isLoading,
    error,
    handleGroupUpdate,
  };
}
