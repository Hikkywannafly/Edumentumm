import GroupContent from "../../../components/group/group-content";
import { PageHeader } from "../../../components/layout";
import DashboardLayout from "../../../components/layout/dashboard-layout";

export default function GroupPage() {
  return (
    <>
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <PageHeader
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
