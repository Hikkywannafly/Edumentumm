"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const locale = pathname.split("/")[1] || "vi";

    document.documentElement.lang = locale;
  }, [pathname]);

  return <>{children}</>;
}
