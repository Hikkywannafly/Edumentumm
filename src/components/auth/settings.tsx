"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getLocaleFromPathname } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Moon, Settings as SettingsIcon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export function Settings() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTheme, setSelectedTheme] = useState(theme || "system");

  const settingsOptions: SettingsOption[] = [
    {
      id: "language",
      title: t("language.title"),
      description: t("language.description"),
      icon: Globe,
      options: [
        { value: "en", label: t("language.en") },
        { value: "vi", label: t("language.vi") },
      ],
    },
    {
      id: "theme",
      title: t("theme.title"),
      description: t("theme.description"),
      icon: theme === "dark" ? Moon : Sun,
      options: [
        { value: "light", label: t("theme.light") },
        { value: "dark", label: t("theme.dark") },
        { value: "system", label: t("theme.system") },
      ],
    },
  ];

  const handleSaveSettings = () => {
    try {
      localStorage.setItem("language", selectedLanguage);
      localStorage.setItem("theme", selectedTheme);

      // Apply theme
      setTheme(selectedTheme);

      toast.success("Settings saved successfully!");

      const locale = getLocaleFromPathname(pathname);
      router.push(`/${locale}/dashboard`);
    } catch (_error) {
      toast.error("Failed to save settings");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4"
    >
      <Card className="w-full max-w-4xl border bg-card/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="rounded-t-lg text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <SettingsIcon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-bold text-3xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="grid grid-cols-1 gap-6">
            {settingsOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.15 }}
                  className="rounded-xl border bg-card p-6"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex-shrink-0 rounded-full bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {option.options.map((opt) => {
                      const isSelected =
                        option.id === "language"
                          ? selectedLanguage === opt.value
                          : selectedTheme === opt.value;

                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => {
                            if (option.id === "language") {
                              setSelectedLanguage(opt.value);
                            } else {
                              setSelectedTheme(opt.value);
                            }
                          }}
                          className={`group cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 hover:scale-105 ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                              : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                          }`}
                        >
                          <div className="text-center">
                            <div
                              className={`font-semibold transition-colors ${
                                isSelected ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {opt.label}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="flex gap-4"
          >
            <Button
              variant="outline"
              onClick={() => {
                const locale = getLocaleFromPathname(pathname);
                router.push(`/${locale}/dashboard`);
              }}
              className="flex-1"
            >
              {t("skip")}
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="flex-1 rounded-xl bg-primary py-3 font-bold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
            >
              {t("save")}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
