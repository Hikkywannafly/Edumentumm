import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: {
    senderId: number;
    senderName: string;
    imageUrl?: string;
    content: string;
    timestamp: string;
  };
  currentUserId: number;
}

export function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isMe = message.senderId === currentUserId;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {!isMe && (
        <Avatar className="h-8 w-8">
          {message.imageUrl ? (
            <AvatarImage src={message.imageUrl} alt={message.senderName} />
          ) : (
            <AvatarFallback>
              {message.senderName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm",
          isMe
            ? "rounded-br-none bg-primary text-primary-foreground"
            : "rounded-bl-none text-gray-900",
        )}
      >
        {!isMe && (
          <p className="mb-1 text-gray-500 text-xs">{message.senderName}</p>
        )}
        <p>{message.content}</p>
        <span className="mt-1 block text-[10px] text-gray-400">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
