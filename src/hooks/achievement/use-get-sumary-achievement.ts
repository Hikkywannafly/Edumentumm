import { useEffect, useState } from "react";
import { type Summary, achievementAPI } from "../../lib/api/achievement";

export default function useGetSummaryAchievement() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    achievementAPI
      .getSummaryAchievement()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Error fetching summary achievement");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return {
    data,
    loading,
    error,
  };
}
