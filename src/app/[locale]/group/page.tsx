import GroupContent from "../../../components/group/group-content";
import DashboardLayout from "../../../components/layout/dashboard-layout";
import { PageHeaderClient } from "../../../components/layout/page-header-client";

export default function GroupPage() {
  return (
    <>
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <PageHeaderClient
            title={"Group Page"}
            showThemeToggle={true}
            showLanguageSwitcher={true}
          />
          <GroupContent />
        </div>
      </DashboardLayout>
    </>
  );
}
