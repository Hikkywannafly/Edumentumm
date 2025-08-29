import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { QuizzesContent } from "@/components/quizzes/quizzes-content";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function QuizzesPage({
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
          title={t("title")}
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />
        {/* Main Content */}
        <QuizzesContent />
      </div>
    </DashboardLayout>
  );
}
