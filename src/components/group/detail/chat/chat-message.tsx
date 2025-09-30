import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";

interface Message {
  roomId: string;
  senderId: number;
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  currentUserId: number;
}

export function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        overflowY: "auto",
        paddingRight: 8,
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      <div className="space-y-4">
        {messages.map((m, idx) => (
          <MessageItem key={idx} message={m} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}
