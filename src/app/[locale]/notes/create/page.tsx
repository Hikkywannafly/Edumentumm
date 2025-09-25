"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { NoteEditor } from "@/components/notes/note-editor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function NoteCreatePage() {
  const router = useRouter();
  const t = useTranslations("Notes");

  const handleBack = () => {
    router.push("/notes");
  };

  const handleSave = () => {
    // Refresh sẽ được xử lý bởi component editor
    router.push("/notes");
  };

  // Tạo object note mới cho editor
  const newNote = {
    id: 0, // ID tạm thời cho note mới
    title: "",
    type: "block" as const,
    ownerId: 0,
    isDeleted: false,
    blocks: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={t("create.title")}
          action={
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("actions.backToNotes")}
            </Button>
          }
          showThemeToggle={true}
          showLanguageSwitcher={true}
          className="border-border border-b"
        />

        {/* Nội dung chính */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor note={newNote} onSave={handleSave} />
        </div>
      </div>
    </DashboardLayout>
  );
}
