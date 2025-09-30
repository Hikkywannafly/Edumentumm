import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/auth-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Channel {
  id: string;
  name: string;
  lastMessage?: string;
  time?: string;
}

export function useChannel(groupId?: string) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const {
    data: channels = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Channel[]>({
    queryKey: ["channels", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const res = await fetch(`${API_BASE_URL}/chat/chanel/${groupId}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Error fetching channels");
      const data = await res.json();
      return data.data || [];
    },
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
  });

  const createChannel = useMutation({
    mutationFn: async (name: string) => {
      if (!groupId || !name) throw new Error("Missing channel information");
      const res = await fetch(`${API_BASE_URL}/chat/chanel/${groupId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(name),
      });
      if (!res.ok) throw new Error("Create channel failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels", groupId] });
    },
  });

  return {
    channels,
    isLoading,
    isError,
    error,
    refetch,
    createChannel,
  };
}

export default useChannel;
