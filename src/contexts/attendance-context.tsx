"use client";

import axios from "axios";
import dayjs from "dayjs";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface AttendanceContextType {
  attended: boolean;
}

const AttendanceContext = createContext<AttendanceContextType>({
  attended: false,
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [attended, setAttended] = useState<boolean>(false);
  const didRequest = useRef(false);

  useEffect(() => {
    if (didRequest.current) return;
    didRequest.current = true;

    const today = dayjs().format("YYYY-MM-DD");
    const attendanceKey = `attendance_done_${today}`;
    const hasAttended = localStorage.getItem(attendanceKey);
    const accessToken = localStorage.getItem("accessToken");

    if (!hasAttended) {
      axios
        .post(
          `${API_BASE_URL}/user/attendance`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}),
            },
          },
        )
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem(attendanceKey, "true");
            setAttended(true);
          }
        })
        .catch((err) => console.error("Attendance failed:", err));
    } else {
      setAttended(true);
    }
  }, []);

  return (
    <AttendanceContext.Provider value={{ attended }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
