"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Home, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { LocalizedLink } from "../localized-link";

interface Error403Props {
  showLoginButton?: boolean;
  onLogin?: () => void;
  customMessage?: string;
}

export default function Error403({
  showLoginButton = true,
  onLogin,
  customMessage,
}: Error403Props) {
  const t = useTranslations("Error403");
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="mb-12 inline-block">
          <div className="relative h-48 w-48 rounded-full bg-gradient-to-br from-red-500 to-red-600 p-8 shadow-2xl transition-transform duration-300 hover:scale-105 sm:h-56 sm:w-56 md:h-64 md:w-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-black text-5xl text-white drop-shadow-lg sm:text-6xl md:text-7xl">
                403
              </span>
            </div>
            <div className="-top-2 -right-2 absolute h-6 w-6 rounded-full bg-red-700 shadow-lg" />
            <div className="-bottom-2 -left-2 absolute h-4 w-4 rounded-full bg-red-700 shadow-lg" />
            <div className="-left-3 absolute top-4 h-3 w-3 rounded-full bg-red-400 shadow-lg" />
          </div>
        </div>

        <h1 className="mb-8 font-black text-2xl text-foreground tracking-widest drop-shadow-sm md:text-3xl lg:text-4xl">
          {t("title")}
        </h1>

        <p className="mx-auto mb-10 max-w-lg text-muted-foreground leading-relaxed md:text-xl">
          {customMessage || t("description")}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <LocalizedLink href="/">
              <Home className="mr-2 h-4 w-4" />
              {t("homeButton")}
            </LocalizedLink>
          </Button>

          {showLoginButton && (
            <Button
              size="lg"
              variant="outline"
              onClick={onLogin}
              asChild={!onLogin}
            >
              {onLogin ? (
                <span>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("loginButton")}
                </span>
              ) : (
                <LocalizedLink href="/login" onClick={() => logout()}>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("loginButton")}
                </LocalizedLink>
              )}
            </Button>
          )}
        </div>

        <div className="mt-8 text-muted-foreground text-sm">
          <p>Error Code: 403 - Forbidden Access</p>
        </div>
      </div>
    </div>
  );
}
