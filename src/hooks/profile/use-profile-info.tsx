import { useEffect, useState } from "react";
import type { GetProfileResponse } from "../../lib/api/profile";
import { profileAPI } from "../../lib/api/profile";

export function useProfileInfo() {
  const [info, setInfo] = useState<GetProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    profileAPI
      .getProfile()
      .then((res) => {
        setInfo(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch profile");
        setInfo(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { info, loading, error };
}
