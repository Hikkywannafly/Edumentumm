"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { LocalizedLink } from "../localized-link";

interface Note {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
}

interface RecentNotesProps {
  notes?: Note[];
}

export default function RecentNotes({ notes = [] }: RecentNotesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Notes
        </CardTitle>
        <Button size="sm" asChild>
          <LocalizedLink href="/notes/create">Create Note</LocalizedLink>
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <h4 className="font-medium text-sm">{note.title}</h4>
                <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                  {note.preview}
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  {note.updatedAt}
                </p>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <LocalizedLink href="/notes">View All Notes</LocalizedLink>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              No notes yet. Create one to organize your study materials!
            </p>
            <Button variant="outline" className="w-full" asChild>
              <LocalizedLink href="/notes/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Note
              </LocalizedLink>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
