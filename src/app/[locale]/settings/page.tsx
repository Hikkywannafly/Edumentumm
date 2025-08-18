import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { setRequestLocale } from "next-intl/server";
import UserSetting from "../../../components/setting-menu/setting";

export default async function SettingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={"Settings"}
          showThemeToggle={true}
          showLanguageSwitcher={true}
        />

        {/* Main Content */}
        <UserSetting />
      </div>
    </DashboardLayout>
  );
}
