"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { QuizEditorContent } from "@/components/quizzes/edit";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
// import { toast } from "sonner";

export default function QuizEditorPage() {
  const t = useTranslations("Quizzes");

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        <PageHeaderClient
          title={t("edit.title")}
          action={
            <div className="flex gap-2">
              <LocalizedLink href="quizzes">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("edit.backToQuizzes")}
                </Button>
              </LocalizedLink>
            </div>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />
        <QuizEditorContent />
      </div>
    </DashboardLayout>
  );
}
