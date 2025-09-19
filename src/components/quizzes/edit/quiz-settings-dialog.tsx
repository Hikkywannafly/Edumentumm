"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { GeneratedQuiz } from "@/types/quiz";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

interface QuizSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: GeneratedQuiz | null;
  onSave: (settings: any) => Promise<void>;
  isSaving?: boolean;
}

export function QuizSettingsDialog({
  open,
  onOpenChange,
  quiz,
  onSave,
  isSaving = false,
}: QuizSettingsDialogProps) {
  const t = useTranslations("Quizzes.editorSettings");
  const tEditor = useTranslations("Quizzes.editor");
  const lastQuizRef = useRef<GeneratedQuiz | null>(null);

  console.log("QuizSettingsDialog rendered with:", { open, quiz });

  // Initialize state with quiz data
  const [settings, setSettings] = useState({
    visibility: "PRIVATE",
    status: "DRAFT",
    isPremium: false,
    isFeatured: false,
    isTrending: false,
    estimatedTime: "10",
    passingScore: "70",
    maxAttempts: "0",
  });

  // Store original settings for comparison
  const [originalSettings, setOriginalSettings] = useState<any>(null);

  // Update state when quiz data changes
  useEffect(() => {
    if (open && quiz && quiz !== lastQuizRef.current) {
      console.log("Updating dialog with new quiz data:", quiz);
      lastQuizRef.current = quiz;
      const newSettings = {
        visibility: quiz.settings?.visibility || "PRIVATE",
        status: quiz.settings?.status || "DRAFT",
        isPremium: quiz.settings?.isPremium || false,
        isFeatured: quiz.settings?.isFeatured || false,
        isTrending: quiz.settings?.isTrending || false,
        estimatedTime:
          quiz.settings?.estimatedTime?.toString() ||
          quiz.metadata?.estimated_time?.toString() ||
          "10",
        passingScore: quiz.settings?.passingScore?.toString() || "70",
        maxAttempts: quiz.settings?.maxAttempts?.toString() || "0",
      };

      console.log("New settings for dialog:", newSettings);
      setSettings(newSettings);
      setOriginalSettings(newSettings);
    }
  }, [open, quiz]);

  // Check if there are changes in settings
  const hasChanges = () => {
    if (!originalSettings) return false;

    const hasChangesResult =
      settings.visibility !== originalSettings.visibility ||
      settings.status !== originalSettings.status ||
      settings.isPremium !== originalSettings.isPremium ||
      settings.isFeatured !== originalSettings.isFeatured ||
      settings.isTrending !== originalSettings.isTrending ||
      settings.estimatedTime !== originalSettings.estimatedTime ||
      settings.passingScore !== originalSettings.passingScore ||
      settings.maxAttempts !== originalSettings.maxAttempts;

    console.log("Checking for changes:", {
      current: settings,
      original: originalSettings,
      hasChanges: hasChangesResult,
    });

    return hasChangesResult;
  };

  const handleApply = async () => {
    console.log("Applying settings:", settings);
    // Create a flat structure that matches what the API expects
    const updatedSettings: any = {
      visibility: settings.visibility,
      status: settings.status,
      isPremium: settings.isPremium,
      isFeatured: settings.isFeatured,
      isTrending: settings.isTrending,
      estimatedTime: Number.parseInt(settings.estimatedTime) || 10,
      passingScore: Number.parseInt(settings.passingScore) || 70,
      maxAttempts: Number.parseInt(settings.maxAttempts) || 0,
    };

    // Also update metadata if it exists
    if (quiz?.metadata) {
      updatedSettings.metadata = {
        ...quiz.metadata,
        estimated_time: Number.parseInt(settings.estimatedTime) || 10,
      };
    }

    try {
      await onSave(updatedSettings);
      console.log("Settings saved successfully");
      // Update the original settings to reflect the saved values
      setOriginalSettings({ ...settings });
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Re-throw to be caught by the parent
      throw error;
    }

    // Add a small delay to ensure cache is updated before closing
    setTimeout(() => {
      // Close the dialog after applying
      onOpenChange(false);
    }, 100);
  };

  // Add a reset function to reset the dialog state when it opens
  useEffect(() => {
    if (open && quiz) {
      const newSettings = {
        visibility: quiz.settings?.visibility || "PRIVATE",
        status: quiz.settings?.status || "DRAFT",
        isPremium: quiz.settings?.isPremium || false,
        isFeatured: quiz.settings?.isFeatured || false,
        isTrending: quiz.settings?.isTrending || false,
        estimatedTime:
          quiz.settings?.estimatedTime?.toString() ||
          quiz.metadata?.estimated_time?.toString() ||
          "10",
        passingScore: quiz.settings?.passingScore?.toString() || "70",
        maxAttempts: quiz.settings?.maxAttempts?.toString() || "0",
      };

      setSettings(newSettings);
      setOriginalSettings(newSettings);
    }
  }, [open, quiz]);

  const handleChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visibility" className="text-right">
              {t("visibility")}
            </Label>
            <Select
              value={settings.visibility}
              onValueChange={(value) => handleChange("visibility", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">{t("private")}</SelectItem>
                <SelectItem value="PUBLIC">{t("public")}</SelectItem>
                <SelectItem value="UNLISTED">{t("unlisted")}</SelectItem>
                <SelectItem value="PREMIUM">{t("premium")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              {t("status")}
            </Label>
            <Select
              value={settings.status}
              onValueChange={(value) => handleChange("status", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">{t("draft")}</SelectItem>
                <SelectItem value="PUBLISHED">{t("published")}</SelectItem>
                <SelectItem value="ARCHIVED">{t("archived")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estimatedTime" className="text-right">
              {t("estimatedTime")}
            </Label>
            <Input
              id="estimatedTime"
              type="number"
              min="1"
              value={settings.estimatedTime}
              onChange={(e) => handleChange("estimatedTime", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="passingScore" className="text-right">
              {t("passingScore")}
            </Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={settings.passingScore}
              onChange={(e) => handleChange("passingScore", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="maxAttempts" className="text-right">
              {t("maxAttempts")}
            </Label>
            <Input
              id="maxAttempts"
              type="number"
              min="0"
              value={settings.maxAttempts}
              onChange={(e) => handleChange("maxAttempts", e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isPremium" className="text-right">
              {t("isPremium")}
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="isPremium"
                checked={settings.isPremium}
                onCheckedChange={(checked) =>
                  handleChange("isPremium", checked)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isFeatured" className="text-right">
              {t("isFeatured")}
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="isFeatured"
                checked={settings.isFeatured}
                onCheckedChange={(checked) =>
                  handleChange("isFeatured", checked)
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isTrending" className="text-right">
              {t("isTrending")}
            </Label>
            <div className="col-span-3 flex items-center">
              <Switch
                id="isTrending"
                checked={settings.isTrending}
                onCheckedChange={(checked) =>
                  handleChange("isTrending", checked)
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="outline"
            onClick={handleApply}
            disabled={isSaving || !hasChanges()}
          >
            {tEditor("apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
