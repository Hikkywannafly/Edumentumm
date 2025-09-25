"use client";

// Server-side function
export const generatetUrl = (locale: string, path: string) => {
  return `/${locale}/${path}`;
};

// Client-side function
export const useLocalizedUrl = () => {
  const { useLocale } = require("next-intl");
  const locale = useLocale();

  return (path: string) => `/${locale}/${path}`;
};

// Fallback function for client components
export const createLocalizedUrl = (path: string) => {
  if (typeof window !== "undefined") {
    const currentLocale = window.location.pathname.split("/")[1] || "vi";
    return `/${currentLocale}/${path}`;
  }
  return `/${path}`;
};

export function extractIdFromSlug(slug: string): string {
  const clean = decodeURIComponent(slug).split(/[?#]/)[0].replace(/\/+$/, "");

  let m = clean.match(/-(\d+)$/);
  if (!m) {
    m = clean.match(/(\d+)$/);
  }
  return m ? `${Number(m[1])}` : "error";
}
