import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
  removeGroup: (groupId: string) => void;
}

export function usePublicGroups(pageSize = 8): UsePublicGroupsReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  // debounce keyword (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const { data, isLoading, error, isFetching } = useQuery<
    { data: GroupResponse[]; pagination: IPagination },
    Error
  >({
    queryKey: ["publicGroups", page, pageSize, debouncedKeyword],
    queryFn: async () =>
      await groupAPI.getGroups(page, pageSize, debouncedKeyword),
    placeholderData: keepPreviousData,
  });

  const removeGroup = (publicId: string) => {
    queryClient.setQueryData<{
      data: GroupResponse[];
      pagination: IPagination;
    }>(["publicGroups", page, pageSize, debouncedKeyword], (old) =>
      old
        ? {
            ...old,
            data: old.data.filter((g) => g.publicId !== publicId),
          }
        : old,
    );
  };

  return {
    groups: data?.data ?? [],
    paging: data?.pagination,
    isLoading,
    error,
    keyword,
    setKeyword,
    setPage,
    isSearching: isFetching && keyword !== debouncedKeyword,
    removeGroup,
  };
}
