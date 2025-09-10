import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Input } from "../ui";

interface AchievementFilterProps {
  keyword: string;
  setKeyword: (v: string) => void;
  rarity: string;
  setRarity: (v: string) => void;
  achieved: boolean | undefined;
  setAchieved: (v: boolean | undefined) => void;
}

export default function AchievementFilter({
  keyword,
  setKeyword,
  rarity,
  setRarity,
  achieved,
  setAchieved,
}: AchievementFilterProps) {
  const t = useTranslations("Achievements");

  const rarityOptions = [
    { value: "", label: t("rarities.title") },
    { value: "COMMON", label: t("rarities.COMMON") },
    { value: "UNCOMMON", label: t("rarities.UNCOMMON") },
    { value: "RARE", label: t("rarities.RARE") },
    { value: "EPIC", label: t("rarities.EPIC") },
    { value: "LEGENDARY", label: t("rarities.LEGENDARY") },
  ];

  const statusOptions = [
    { value: undefined, label: t("status.title") },
    { value: true, label: t("status.COMPLETED") },
    { value: false, label: t("status.NOT_STARTED") },
  ];

  return (
    <section className="mb-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-grow">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white py-2 pr-4 pl-10 text-black text-sm shadow-sm placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-offset-zinc-900 dark:placeholder:text-zinc-400"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-56 items-center justify-between rounded-md border border-zinc-300 bg-white px-4 py-2 text-black text-sm shadow-sm transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-offset-zinc-900 dark:hover:bg-zinc-700">
            {rarityOptions.find((r) => r.value === rarity)?.label ||
              t("rarities.title")}
            <ChevronDown className="ml-2 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-50 mt-1 w-56 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
            {rarityOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                className="cursor-pointer rounded px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                onClick={() => setRarity(opt.value)}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-56 items-center justify-between rounded-md border border-zinc-300 bg-white px-4 py-2 text-black text-sm shadow-sm transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:ring-offset-zinc-900 dark:hover:bg-zinc-700">
            {statusOptions.find((s) => s.value === achieved)?.label ||
              t("status.title")}
            <ChevronDown className="ml-2 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-50 mt-1 w-56 rounded-md border border-zinc-200 bg-white p-1 shadow-md dark:border-zinc-700 dark:bg-zinc-800">
            {statusOptions.map((opt) => (
              <DropdownMenuItem
                key={String(opt.value)}
                className="cursor-pointer rounded px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                onClick={() => setAchieved(opt.value)}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
