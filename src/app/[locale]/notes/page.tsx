import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { NoteCreateButton } from "@/components/notes/note-create-button";
import { NotesContent } from "@/components/notes/notes-content";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Notes");

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("title")}
          action={<NoteCreateButton />}
          showThemeToggle={true}
          showLanguageSwitcher={true}
          className="border-border border-b"
        />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <NotesContent />
        </div>
      </div>
    </DashboardLayout>
  );
}
