"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { getLocaleFromPathname } from "@/lib/utils";
import { LogOut, Settings, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function SettingMenu() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getInitials = (username?: string, email?: string) => {
    if (username) {
      return username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  const initials = getInitials(user?.username, user?.email);
  const displayName = user?.username || user?.email || "User";

  const handleProfileClick = () => {
    const locale = getLocaleFromPathname(pathname);
    router.push(`/${locale}/profile`);
  };

  const handleSettingsClick = () => {
    const locale = getLocaleFromPathname(pathname);
    router.push(`/${locale}/settings`);
  };

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        className="relative h-10 w-10 animate-pulse rounded-full"
        disabled
      >
        <Avatar className="h-10 w-10">
          <AvatarFallback className="font-medium text-base">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-indigo-500/70 transition hover:ring-indigo-600"
        >
          <Avatar className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-4 border-background">
            <AvatarImage
              src={user?.imageUrl || "/placeholder.svg"}
              className="h-full w-full object-cover"
            />
            <AvatarFallback className="flex h-full w-full items-center justify-center bg-muted font-bold text-4xl">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 rounded-xl border-0 bg-white p-0 shadow-xl dark:bg-zinc-900"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className=" border-b p-4 pb-2 font-normal dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <Avatar className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-4 border-background">
              <AvatarImage
                src={user?.imageUrl || "/placeholder.svg"}
                className="h-full w-full object-cover"
              />
              <AvatarFallback className="flex h-full w-full items-center justify-center bg-muted font-bold text-4xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-base">{displayName}</span>
              {user?.email && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user.email}
                </span>
              )}
              {user?.roles && user.roles.length > 0 && (
                <span className="mt-1 text-indigo-600 text-xs dark:text-indigo-400">
                  {user.roles
                    .map((role) => role.name.replace("ROLE_", ""))
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 px-4 py-3 transition hover:bg-indigo-50 dark:hover:bg-zinc-800"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5" />
          <span className="font-medium">Trang cá nhân</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 px-4 py-3 transition hover:bg-indigo-50 dark:hover:bg-zinc-800"
          onClick={handleSettingsClick}
        >
          <Settings className="h-5 w-5" />
          <span className="font-medium">Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-2 px-4 py-3 text-red-600 transition hover:bg-red-50 dark:hover:bg-zinc-800"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 text-red-600" />
          <span className="font-medium ">Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
