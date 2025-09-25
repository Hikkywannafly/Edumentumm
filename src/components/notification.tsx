"use client";

import { Button } from "@/components/ui/button";
import { BellRing, CheckCircle2, Info, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const notifications = [
  {
    id: 1,
    title: "Chào mừng bạn đến với Edumentum!",
    content: "Khám phá các khóa học mới ngay hôm nay.",
    time: "1 phút trước",
    unread: true,
    type: "info",
  },
  {
    id: 2,
    title: "Bạn đã hoàn thành bài kiểm tra",
    content: "Chúc mừng! Bạn vừa hoàn thành bài kiểm tra Toán.",
    time: "2 giờ trước",
    unread: false,
    type: "success",
  },
  {
    id: 3,
    title: "Cập nhật hệ thống",
    content: "Hệ thống sẽ bảo trì vào 22:00 tối nay.",
    time: "Hôm qua",
    unread: false,
    type: "warning",
  },
];

function getIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    case "warning":
      return <Star className="h-5 w-5 text-yellow-500" />;
    default:
      return <BellRing className="h-5 w-5 text-blue-400" />;
  }
}

export function Notification() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 rounded-full p-0 transition hover:bg-blue-50 dark:hover:bg-zinc-800"
        aria-label="Xem thông báo"
        onClick={() => setOpen((v) => !v)}
      >
        <BellRing className="h-5 w-5 animate-bounce text-blue-600 dark:text-blue-400" />
      </Button>
      {unreadCount > 0 && (
        <span className="-top-1 -right-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 font-bold text-[10px] text-white shadow">
          {unreadCount}
        </span>
      )}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-120 animate-fade-in rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-2 border-zinc-100 border-b p-4 font-semibold text-blue-700 text-sm dark:border-zinc-800 dark:text-blue-300">
            <BellRing className="h-5 w-5" />
            Thông báo
          </div>
          <ul className="max-h-96 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {notifications.length === 0 && (
              <li className="p-6 text-center text-base text-zinc-400">
                Không có thông báo nào
              </li>
            )}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex cursor-pointer gap-3 px-5 py-4 transition hover:bg-blue-50 dark:hover:bg-zinc-800 ${
                  n.unread ? "bg-blue-50/60 dark:bg-zinc-800/60" : ""
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-zinc-800">
                  {getIcon(n.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-zinc-900 dark:text-white">
                      {n.title}
                    </span>
                    {n.unread && (
                      <span className="ml-1 inline-block h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <span className="block truncate text-sm text-zinc-600 dark:text-zinc-300">
                    {n.content}
                  </span>
                  <span className="text-xs text-zinc-400">{n.time}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
