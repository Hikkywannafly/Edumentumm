import { useQuery } from "@tanstack/react-query";
import { type GetDailyQuizResponse, profileAPI } from "../../lib/api/profile";

export function useProfileDailyQuiz() {
  const {
    data: info,
    isLoading: loading,
    error,
  } = useQuery<GetDailyQuizResponse[], Error>({
    queryKey: ["profileDailyQuiz"],
    queryFn: () => profileAPI.getDailyQuiz(),
    staleTime: 120 * 60 * 1000, // cache 2 giờ
    retry: 1,
  });

  return {
    info,
    loading,
    error: error ? error.message : null,
  };
}
