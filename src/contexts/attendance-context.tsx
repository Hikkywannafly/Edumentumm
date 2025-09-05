"use client";

import axios from "axios";
import dayjs from "dayjs";
import type React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

interface AttendanceContextType {
  attended: boolean;
  attendanceDates: string[];
}

const AttendanceContext = createContext<AttendanceContextType>({
  attended: false,
  attendanceDates: [],
});

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [attended, setAttended] = useState<boolean>(false);
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const didRequest = useRef(false);

  useEffect(() => {
    if (didRequest.current) return;
    didRequest.current = true;

    const today = dayjs().format("YYYY-MM-DD");
    const attendanceKey = "attendance_dates";
    const accessToken = localStorage.getItem("accessToken");

    let storedDates: string[] = [];
    try {
      const raw = localStorage.getItem(attendanceKey);
      if (raw) storedDates = JSON.parse(raw);
    } catch {
      storedDates = [];
    }

    if (storedDates.includes(today)) {
      setAttended(true);
      setAttendanceDates(storedDates);
      return;
    }

    axios
      .post(
        `${API_BASE_URL}/user/attendance`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        },
      )
      .then((res) => {
        if (res.status === 200) {
          const newDates = [...storedDates, today];
          localStorage.setItem(attendanceKey, JSON.stringify(newDates));
          setAttended(true);
          setAttendanceDates(newDates);
        }
      })
      .catch((err) => {
        setAttendanceDates(storedDates);
        console.error("Attendance failed:", err);
      });
  }, []);

  return (
    <AttendanceContext.Provider value={{ attended, attendanceDates }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
