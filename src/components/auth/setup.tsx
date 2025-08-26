"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { ROLE_OPTIONS } from "@/lib/schemas/auth";
import { getLocaleFromPathname } from "@/lib/utils";
import { Roles } from "@/types/auth";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle,
  Globe,
  Moon,
  Settings as SettingsIcon,
  Sun,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const roleIcons: Record<Roles, React.ElementType> = {
  [Roles.STUDENT]: User,
  [Roles.TEACHER]: Briefcase,
  [Roles.GUEST]: CheckCircle,
};

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

export function Setup() {
  const t = useTranslations("Setup");
  const settingsT = useTranslations("Settings");
  const roleT = useTranslations("RoleSelector");
  const { selectRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Roles | null>(Roles.STUDENT);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedTheme, setSelectedTheme] = useState(theme || "system");

  const settingsOptions: SettingsOption[] = [
    {
      id: "language",
      title: settingsT("language.title"),
      description: settingsT("language.description"),
      icon: Globe,
      options: [
        { value: "en", label: settingsT("language.en") },
        { value: "vi", label: settingsT("language.vi") },
      ],
    },
    {
      id: "theme",
      title: settingsT("theme.title"),
      description: settingsT("theme.description"),
      icon: theme === "dark" ? Moon : Sun,
      options: [
        { value: "light", label: settingsT("theme.light") },
        { value: "dark", label: settingsT("theme.dark") },
        { value: "system", label: settingsT("theme.system") },
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
      setCurrentStep(2);
    } catch (_error) {
      toast.error("Failed to save settings");
    }
  };

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    try {
      await selectRole(selectedRole);
      toast.success("Role selected successfully!");

      // Use replace instead of push to avoid back navigation
      const locale = getLocaleFromPathname(pathname);
      router.replace(`/${locale}/dashboard`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to select role",
      );
    }
  };

  const handleSkip = () => {
    setCurrentStep(2);
  };

  const renderSettings = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="mb-2 font-bold text-2xl">{settingsT("title")}</h2>
        <p className="text-muted-foreground">{settingsT("description")}</p>
      </div>

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

      <div className="flex gap-4">
        <Button variant="outline" onClick={handleSkip} className="flex-1">
          {t("skip")}
        </Button>
        <Button
          onClick={handleSaveSettings}
          className="flex-1 rounded-xl bg-primary py-3 font-bold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
        >
          {t("continue")}
        </Button>
      </div>
    </motion.div>
  );

  const renderRoleSelector = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="mb-2 font-bold text-2xl">{roleT("title")}</h2>
        <p className="text-muted-foreground">{roleT("description")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ROLE_OPTIONS.filter((role) => role.name !== Roles.GUEST).map(
          (role, index) => {
            const Icon = roleIcons[role.name];
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.15 }}
                className={`group cursor-pointer rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
                  selectedRole === role.id
                    ? "bg-primary/10 shadow-lg shadow-primary/20"
                    : "bg-card hover:border-primary/50 hover:shadow-md"
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 rounded-full p-3 transition-all duration-300 ${
                      selectedRole === role.id
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    {Icon && <Icon className="h-8 w-8" />}
                  </div>
                  <div className="flex-grow">
                    <h3
                      className={`font-bold text-lg transition-colors ${
                        selectedRole === role.id
                          ? "text-primary"
                          : "text-foreground"
                      }`}
                    >
                      {roleT(`roles.${role.name}.title`)}
                    </h3>
                    <p
                      className={`text-sm transition-colors ${
                        selectedRole === role.id
                          ? "text-primary/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {roleT(`roles.${role.name}.description`)}
                    </p>
                  </div>
                  <div
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      selectedRole === role.id
                        ? "border-primary bg-primary shadow-md"
                        : "border-border group-hover:border-primary/60"
                    }`}
                  >
                    {selectedRole === role.id && (
                      <svg
                        className="h-3 w-3 text-primary-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          },
        )}
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(1)}
          className="flex-1"
        >
          {t("back")}
        </Button>
        <Button
          onClick={handleRoleSelect}
          disabled={!selectedRole || isLoading}
          className="flex-1 rounded-xl bg-primary py-3 font-bold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
        >
          {isLoading ? roleT("selecting") : t("complete")}
        </Button>
      </div>
    </motion.div>
  );

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

          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <div
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  currentStep >= 1 ? "bg-primary" : "bg-muted"
                }`}
              />
              <div
                className={`h-2 w-8 rounded-full transition-all duration-300 ${
                  currentStep >= 2 ? "bg-primary" : "bg-muted"
                }`}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {currentStep === 1 ? renderSettings() : renderRoleSelector()}
        </CardContent>
      </Card>
    </motion.div>
  );
}
