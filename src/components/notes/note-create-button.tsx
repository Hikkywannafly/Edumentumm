"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateNoteWithTemplate } from "@/hooks/note";
import { Calendar, ChevronDown, FileText, Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NoteCreateButton() {
  const t = useTranslations("Notes");
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const { createWithTemplate } = useCreateNoteWithTemplate();

  const handleCreateNote = async (template?: "blank" | "meeting" | "daily") => {
    try {
      setIsCreating(true);

      const templateTitles = {
        blank: t("create.templates.blank.title"),
        meeting: t("create.templates.meeting.title"),
        daily: t("create.templates.daily.title"),
      };

      const title = templateTitles[template || "blank"] || "New Note";
      const newNote = await createWithTemplate(title, template);

      // Navigate to the new note editor
      router.push(`/notes/${newNote.id}`);

      toast.success(t("create.success"));
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error(t("create.error"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isCreating} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("create.button")}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleCreateNote("blank")}>
          <FileText className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">
              {t("create.templates.blank.title")}
            </span>
            <span className="text-muted-foreground text-xs">
              {t("create.templates.blank.description")}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => handleCreateNote("meeting")}>
          <Users className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">
              {t("create.templates.meeting.title")}
            </span>
            <span className="text-muted-foreground text-xs">
              {t("create.templates.meeting.description")}
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleCreateNote("daily")}>
          <Calendar className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span className="font-medium">
              {t("create.templates.daily.title")}
            </span>
            <span className="text-muted-foreground text-xs">
              {t("create.templates.daily.description")}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
