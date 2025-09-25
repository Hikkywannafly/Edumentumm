"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useState } from "react";

const LOCALE_STORAGE_KEY = "edumentum-locale";
const LOCALE_COOKIE_KEY = "edumentum-locale";

export function useLocalePersistence() {
  const locale = useLocale();
  const [currentLocale, setCurrentLocale] = useState(locale);

  const saveLocale = useCallback((newLocale: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `${LOCALE_COOKIE_KEY}=${newLocale}; expires=${expires.toUTCString()}; path=/`;

      setCurrentLocale(newLocale);
    }
  }, []);

  const getSavedLocale = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCALE_STORAGE_KEY);
    }
    return null;
  }, []);

  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);

  useEffect(() => {
    saveLocale(locale);
  }, [locale, saveLocale]);

  return {
    locale: currentLocale,
    saveLocale,
    getSavedLocale,
  };
}
