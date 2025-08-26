import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract locale from pathname
 * @param pathname - The current pathname (e.g., "/vi/dashboard", "/en/login")
 * @returns The locale string (e.g., "vi", "en")
 */
export function getLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  return segments[1] || "en";
}
