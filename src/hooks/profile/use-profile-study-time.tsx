import { useQuery } from "@tanstack/react-query";
import { type GetStudyTimeResponse, profileAPI } from "../../lib/api/profile";

export function useProfileStudyTime() {
  const {
    data: studyTime,
    isLoading,
    error,
  } = useQuery<GetStudyTimeResponse>({
    queryKey: ["studyTime"],
    queryFn: async () => {
      const res = await profileAPI.getStudyTime();
      return res;
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  return {
    studyTime: studyTime ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
