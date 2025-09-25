"use client";

import type React from "react";
import { createContext, useCallback, useEffect, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const PingContext = createContext({});

export const PingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pingServer = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      await fetch(`${API_BASE_URL}/user/study-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      console.log("✅ Ping thành công");
    } catch (err) {
      console.error("❌ Ping lỗi:", err);
    }
  }, []);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      pingServer();
      intervalRef.current = setInterval(pingServer, 60_000);
    }, 60_000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pingServer]);

  return <PingContext.Provider value={{}}>{children}</PingContext.Provider>;
};
