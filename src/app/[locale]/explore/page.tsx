import DashboardLayout from "@/components/layout/dashboard-layout";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import ExploreContent from "../../../components/explore/explore-content";
import { PageHeaderClient } from "../../../components/layout/page-header-client";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Explore");
  return (
    <>
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <PageHeaderClient
            title={t("title")}
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />
          <ExploreContent />
        </div>
      </DashboardLayout>
    </>
  );
}
