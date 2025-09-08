import { FlashcardsContent } from "@/components/flashcards/flashcards-content";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Flashcards");

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
        <FlashcardsContent />
      </div>
    </DashboardLayout>
  );
}
