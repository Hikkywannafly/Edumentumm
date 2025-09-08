import { useEffect, useState } from "react";
import { type Achievement, achievementAPI } from "../../lib/api/achievement";

export default function useGetAllAchievement() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    achievementAPI
      .getAllAchievement()
      .then((res) => {
        setAchievements(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch achievements");
        setAchievements([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { achievements, loading, error };
}
