import { ArrowLeft } from "lucide-react";
import GroupDetailContent from "../../../../components/group/detail/group-detail-content";
import { PageHeader } from "../../../../components/layout";
import DashboardLayout from "../../../../components/layout/dashboard-layout";
import { LocalizedLink } from "../../../../components/localized-link";
import { Button } from "../../../../components/ui";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const { id } = await params;
  return (
    <>
      <DashboardLayout>
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <PageHeader
            title={"Group Page"}
            showThemeToggle={true}
            showLanguageSwitcher={true}
            action={
              <div className="flex gap-2">
                <LocalizedLink href="group">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                </LocalizedLink>
              </div>
            }
          />
          <GroupDetailContent id={id} />
        </div>
      </DashboardLayout>
    </>
  );
}
