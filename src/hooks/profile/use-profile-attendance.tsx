import { useEffect, useState } from "react";
import { profileAPI } from "../../lib/api/profile";

export function useProfileAttendance() {
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    profileAPI
      .getAttendance()
      .then((res) => {
        setAttendanceDates(
          Array.isArray(res) ? res.map((i: any) => i.localDate) : [],
        );
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch profile");
        setAttendanceDates([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { attendanceDates, loading, error };
}
