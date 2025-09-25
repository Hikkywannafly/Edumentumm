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
import { Briefcase, CheckCircle, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const roleIcons: Record<Roles, React.ElementType> = {
  [Roles.STUDENT]: User,
  [Roles.TEACHER]: Briefcase,
  [Roles.GUEST]: CheckCircle,
};

export function RoleSelector() {
  const t = useTranslations("RoleSelector");
  const { selectRole, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedRole, setSelectedRole] = useState<Roles | null>(Roles.STUDENT);

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }
    try {
      await selectRole(selectedRole);
      toast.success("Role selected successfully!");

      setTimeout(() => {
        const locale = getLocaleFromPathname(pathname);
        router.push(`/${locale}/dashboard`);
      }, 500);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to select role",
      );
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
        <CardHeader className="rounded-t-lg text-center ">
          <CardTitle className="font-bold text-3xl">{t("title")}</CardTitle>
          <CardDescription className="">{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
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
                        ? " bg-primary/10 shadow-lg shadow-primary/20"
                        : " bg-card hover:border-primary/50 hover:shadow-md"
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
                          {t(`roles.${role.name}.title`)}
                        </h3>
                        <p
                          className={`text-sm transition-colors ${
                            selectedRole === role.id
                              ? "text-primary/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {t(`roles.${role.name}.description`)}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Button
              onClick={handleRoleSelect}
              disabled={!selectedRole || isLoading}
              className="w-full rounded-xl bg-primary py-3 font-bold text-lg text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl"
            >
              {isLoading ? t("selecting") : t("continue")}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
