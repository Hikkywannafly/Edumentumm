"use client";

import { createLocalizedHref } from "@/lib/utils/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import type { LinkProps } from "next/link";
import type { ReactNode } from "react";

interface LocalizedLinkProps extends LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function LocalizedLink({
  href,
  children,
  className,
  prefetch,
  ...props
}: LocalizedLinkProps) {
  const locale = useLocale();
  const localizedHref = createLocalizedHref(href, locale);

  return (
    <Link
      href={localizedHref}
      className={className}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Link>
  );
}
