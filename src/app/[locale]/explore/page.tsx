import { PageHeader } from "@/components/layout";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import ExploreContent from "../../../components/explore/explore-content";

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
          <PageHeader
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
