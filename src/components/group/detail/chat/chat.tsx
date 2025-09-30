"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { useAuth } from "../../../../contexts/auth-context";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-message";

interface ChatProps {
  setClose: () => void;
  roomId: string;
  name: string;
  channelId: string;
  currentUserId: number;
  currentUserName?: string;
  currentUserAvatar?: string;
}

interface Message {
  roomId: string;
  senderId: number;
  channelId: string;
  senderName: string;
  imageUrl: string;
  content: string;
  timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Chat({
  setClose,
  roomId,
  name,
  currentUserId,
  channelId,
  currentUserName,
  currentUserAvatar,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef<Client | null>(null);
  const { accessToken } = useAuth();

  // Load lịch sử tin nhắn
  const fetchHistory = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/chat/groups/${roomId}/${channelId}/messages`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!res.ok) throw new Error("Không thể tải lịch sử tin nhắn");
      const json = await res.json();
      const history: Message[] = json.data || [];
      setMessages(history.reverse());
    } catch (err) {
      console.error("Lỗi khi lấy lịch sử tin nhắn:", err);
    } finally {
      setLoading(false);
    }
  }, [roomId, channelId, accessToken]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = new SockJS("http://localhost:8080/ws-chat");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("WebSocket connected");
        setConnected(true);
        client.subscribe(`/topic/room/${roomId}/${channelId}`, (message) => {
          if (message.body) {
            const msg: Message = JSON.parse(message.body);
            setMessages((prev) => [...prev, msg]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [roomId, channelId, accessToken]);

  // Gửi tin nhắn
  const handleSendMessage = (content: string) => {
    if (!clientRef.current || !connected) return;

    const message: Message = {
      roomId: roomId,
      channelId: channelId,
      senderId: currentUserId,
      senderName: currentUserName || "Anonymous",
      imageUrl: currentUserAvatar || "",
      content,
      timestamp: new Date().toISOString(),
    };
    console.log(message);
    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });
  };

  return (
    <Card className="flex h-[480px] w-[360px] flex-col overflow-hidden rounded-lg bg-white shadow-lg">
      <ChatHeader name={name} setClose={setClose} />
      <CardContent className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-2 p-2">
            <Skeleton className="h-6 w-2/3 rounded" />
            <Skeleton className="h-6 w-1/2 rounded" />
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-6 w-1/3 rounded" />
          </div>
        ) : (
          <ChatMessages messages={messages} currentUserId={currentUserId} />
        )}
      </CardContent>
      <ChatInput onSend={handleSendMessage} disabled={!connected || loading} />
    </Card>
  );
}
