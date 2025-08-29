import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { LocalizedLink } from "@/components/localized-link";
import { QuizCreator } from "@/components/quizzes/create/quiz-creator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function CreateQuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Quizzes");

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("create.title")}
          action={
            <LocalizedLink href="quizzes">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("create.backToQuizzes")}
              </Button>
            </LocalizedLink>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        {/* Main Content */}
        <QuizCreator />
      </div>
    </DashboardLayout>
  );
}
