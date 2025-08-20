import { ArrowLeft } from "lucide-react";
import GroupStoreContent from "../../../../../components/group/detail/store/group-store-content";
import { PageHeader } from "../../../../../components/layout";
import DashboardLayout from "../../../../../components/layout/dashboard-layout";
import { LocalizedLink } from "../../../../../components/localized-link";
import { Button } from "../../../../../components/ui";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupStore({ params }: GroupDetailPageProps) {
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
                <LocalizedLink href={`/group/${id}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                </LocalizedLink>
              </div>
            }
          />
          <GroupStoreContent id={id} />
        </div>
      </DashboardLayout>
    </>
  );
}
