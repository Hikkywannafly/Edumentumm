"use client";

import { LocalizedLink } from "@/components/localized-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { EmptyStateProps } from "@/types/quiz-display";
import { Plus } from "lucide-react";

export function EmptyState({
  title,
  description,
  buttonText,
  createHref,
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <LocalizedLink href={createHref}>
            <Button>{buttonText}</Button>
          </LocalizedLink>
        </div>
      </CardContent>
    </Card>
  );
}
