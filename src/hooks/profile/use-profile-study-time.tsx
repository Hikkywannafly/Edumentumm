import { useEffect, useState } from "react";
import { type GetStudyTimeResponse, profileAPI } from "../../lib/api/profile";

export function useProfileStudyTime() {
  const [studyTime, setStudyTime] = useState<GetStudyTimeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    profileAPI
      .getStudyTime()
      .then((res) => {
        setStudyTime(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch study time");
        setStudyTime(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { studyTime, loading, error };
}
