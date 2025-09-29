import { useEffect, useRef, useState } from "react";
import {
  type Achievement,
  type IPagination,
  achievementAPI,
} from "../../lib/api/achievement";

interface UseAchievementsReturn {
  achievements: Achievement[];
  paging: IPagination | null;
  loading: boolean;
  error: string | null;
  keyword: string;
  setKeyword: (keyword: string) => void;
  setPage: (page: number) => void;
  isSearching: boolean;
  rarity: string;
  setRarity: (rarity: string) => void;
  achieved: boolean | undefined;
  setAchieved: (achieved: boolean | undefined) => void;
}

export default function useGetAllAchievement(
  pageSize = 12,
): UseAchievementsReturn {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);
  const [rarity, setRarity] = useState(""); // "" = all
  const [achieved, setAchieved] = useState<boolean | undefined>(undefined); // undefined = all
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [paging, setPaging] = useState<IPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const prevData = useRef<Achievement[]>([]);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setLoading(true);
    achievementAPI
      .getAllAchievement(page, pageSize, debouncedKeyword, rarity, achieved)
      .then((res) => {
        prevData.current = res.data;
        setAchievements(res.data);
        setPaging(res.pagination);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || "Failed to fetch achievements");
        setAchievements(prevData.current);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, debouncedKeyword, rarity, achieved]);

  return {
    achievements,
    paging,
    loading,
    error,
    keyword,
    setKeyword,
    setPage,
    isSearching,
    rarity,
    setRarity,
    achieved,
    setAchieved,
  };
}
