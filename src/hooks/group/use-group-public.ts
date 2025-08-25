import { useEffect, useState } from "react";
import { groupAPI } from "../../lib/api/group";
import type { GroupResponse, IPagination } from "../../types/group";

interface UsePublicGroupsReturn {
  groups: GroupResponse[];
  paging: IPagination | undefined;
  isLoading: boolean;
  error: Error | null;
  keyword: string;
  setKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  isSearching: boolean;
  removeGroup: (groupId: number) => void;
}

export function usePublicGroups(pageSize = 8): UsePublicGroupsReturn {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [paging, setPaging] = useState<IPagination>();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce keyword changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Update searching state
  useEffect(() => {
    setIsSearching(keyword !== debouncedKeyword);
  }, [keyword, debouncedKeyword]);

  // Fetch public groups
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const publicGroupsData = await groupAPI.getGroups(
          page,
          pageSize,
          debouncedKeyword,
        );
        setGroups(publicGroupsData.data);
        setPaging(publicGroupsData.pagination);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to fetch public groups"),
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [page, pageSize, debouncedKeyword]);

  const removeGroup = (groupId: number) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  return {
    groups,
    paging,
    isLoading,
    error,
    keyword,
    setKeyword,
    setPage,
    isSearching,
    removeGroup,
  };
}
