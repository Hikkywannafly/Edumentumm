"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { NoteEditor } from "@/components/notes/note-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { noteAPI } from "@/lib/api/note";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

export default function NoteEditPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Notes");
  const noteId = Number.parseInt(params.id as string);

  const {
    data: note,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: () => noteAPI.getNoteById(noteId),
    enabled: !!noteId && !Number.isNaN(noteId),
  });

  const handleBack = () => {
    router.push("/notes");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageHeaderClient
          title={t("edit.title")}
          showThemeToggle={true}
          showLanguageSwitcher={true}
          className="border-border border-b"
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <PageHeaderClient
          title={t("edit.title")}
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
        <div className="container mx-auto py-8">
          <Card className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("errors.failedToLoadNote")}
              </AlertDescription>
            </Alert>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!note) {
    return (
      <DashboardLayout>
        <PageHeaderClient
          title={t("edit.title")}
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
        <div className="container mx-auto py-8">
          <Card className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{t("errors.noteNotFound")}</AlertDescription>
            </Alert>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <PageHeaderClient
          title={note.title || t("edit.untitledNote")}
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

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <NoteEditor note={note} onSave={refetch} />
        </div>
      </div>
    </DashboardLayout>
  );
}
