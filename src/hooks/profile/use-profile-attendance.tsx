import { useQuery } from "@tanstack/react-query";
import { profileAPI } from "../../lib/api/profile";

export function useProfileAttendance() {
  const {
    data: attendanceDates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const res = await profileAPI.getAttendance();
      return Array.isArray(res) ? res.map((i: any) => i.localDate) : [];
    },
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
  });

  return {
    attendanceDates,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  };
}
