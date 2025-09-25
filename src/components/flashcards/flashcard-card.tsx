"use client";
import { LocalizedLink } from "@/components/localized-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { htmlToText } from "@/lib/utils/text";
import type { FlashcardSet } from "@/types/flashcard";
import { Calendar, FileText, Globe, Lock, User } from "lucide-react";
import { useTranslations } from "next-intl";

interface FlashcardCardProps {
  flashcardSet: FlashcardSet;
}

export function FlashcardCard({ flashcardSet }: FlashcardCardProps) {
  const t = useTranslations("Flashcards");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="flex h-full flex-col shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="line-clamp-2 min-h-[3.5rem] font-semibold text-lg leading-tight">
              {htmlToText(flashcardSet.title)}
            </h3>
            <p className="line-clamp-2 min-h-[2.5rem] text-muted-foreground text-sm">
              {htmlToText(flashcardSet.description)}
            </p>
          </div>
          <div className="ml-3 flex flex-shrink-0 items-center gap-1">
            {flashcardSet.isPublic ? (
              <Globe className="h-4 w-4 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-3">
          {/* Stats */}
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>
                {flashcardSet.flashcards.length} {t("flashcardCard.cards")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(flashcardSet.createdAt)}</span>
            </div>
          </div>

          {/* Author */}
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">
              {flashcardSet.user?.username}
            </span>
            <Badge variant="secondary" className="text-xs">
              {flashcardSet.user?.roles[0]?.name.replace("ROLE_", "")}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <LocalizedLink
            href={`/flashcards/${flashcardSet.id}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              {t("study")}
            </Button>
          </LocalizedLink>
          <LocalizedLink
            href={`/flashcards/${flashcardSet.id}/edit`}
            className="flex-1"
          >
            <Button className="w-full">{t("edit")}</Button>
          </LocalizedLink>
        </div>
      </CardFooter>
    </Card>
  );
}
