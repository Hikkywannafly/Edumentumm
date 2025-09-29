"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { NoteEditor } from "@/components/notes/note-editor";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { noteAPI } from "@/lib/api/note";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NoteEditPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("Notes");
  const queryClient = useQueryClient();
  const noteId = Number.parseInt(params.id as string);

  // Check if user is authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("No access token found, redirecting to login");
      router.push("/login");
      return;
    }
  }, [router]);

  // Handler to create test note if ID=1 doesn't exist
  const handleCreateTestNote = async () => {
    try {
      const testNote = await noteAPI.createNote({
        title: "Test Note",
        type: "block",
        tags: [],
      });
      console.log("Test note created:", testNote);
      const locale = params.locale as string;
      router.push(`/${locale}/notes/edit/${testNote.id}`);
    } catch (error) {
      console.error("Failed to create test note:", error);
    }
  };

  const {
    data: note,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["note", noteId],
    queryFn: async () => {
      console.log("Fetching note with ID:", noteId);
      try {
        const result = await noteAPI.getNoteById(noteId);
        console.log("Note fetched successfully:", result);
        return result;
      } catch (err) {
        console.error("Failed to fetch note:", err);
        throw err;
      }
    },
    enabled: !!noteId && !Number.isNaN(noteId),
    retry: 1,
  });

  console.log("Query state:", { note, isLoading, error, noteId });

  const handleBack = () => {
    const locale = params.locale as string;
    // Invalidate queries để refresh danh sách notes khi quay lại
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    router.push(`/${locale}/notes`);
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
    console.error("Note query error:", error);
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
                {error.message.includes("No access token")
                  ? "Vui lòng đăng nhập để xem ghi chú"
                  : t("errors.failedToLoadNote")}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => refetch()} variant="outline">
                {t("actions.retry")}
              </Button>
            </div>
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
            <div className="mt-4 space-x-2">
              <Button onClick={() => refetch()} variant="outline">
                {t("actions.retry")}
              </Button>
              <Button onClick={handleCreateTestNote} variant="default">
                Create Test Note
              </Button>
            </div>
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
