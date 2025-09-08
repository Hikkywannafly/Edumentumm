import { format, subDays } from "date-fns";
import {} from "lucide-react";
import { useMemo, useState } from "react";

const today = new Date();

const weekDays = Array.from({ length: 7 }).map((_, idx) =>
  format(subDays(today, idx), "dd/MM"),
);

const getDaysInMonth = (y: number, m: number) =>
  new Date(y, m + 1, 0).getDate();
const getFirstDayOfWeek = (y: number, m: number) => {
  const d = new Date(y, m, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

const dayOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hourBlocks2h = [
  "0-2h",
  "2-4h",
  "4-6h",
  "6-8h",
  "8-10h",
  "10-12h",
  "12-14h",
  "14-16h",
  "16-18h",
  "18-20h",
  "20-22h",
  "22-24h",
];

export function useProfile() {
  const today = new Date();
  const [calendar, setCalendar] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const { year, month } = calendar;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);
  const daysArray = useMemo(
    () => [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ],
    [daysInMonth, firstDayOfWeek],
  );

  const productivityData = [
    { name: "Mon", time: 60, focus: 80 },
    { name: "Tue", time: 45, focus: 60 },
    { name: "Wed", time: 80, focus: 90 },
    { name: "Thu", time: 30, focus: 50 },
    { name: "Fri", time: 90, focus: 70 },
    { name: "Sat", time: 120, focus: 95 },
    { name: "Sun", time: 70, focus: 85 },
  ];

  return {
    calendar,
    setCalendar,
    daysArray,
    year,
    dayOfTheWeek,
    month,
    productivityData,
    weekDays,
    hourBlocks2h,
  };
}
