"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { LocalizedLink } from "../localized-link";

interface KanbanBoardProps {
  boardCount?: number;
}

export default function KanbanBoard({ boardCount = 0 }: KanbanBoardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Kanban Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        {boardCount > 0 ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              You have {boardCount} active kanban boards
            </p>
            <Button variant="outline" className="w-full" asChild>
              <LocalizedLink href="/kanban">View Boards</LocalizedLink>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              No active kanban boards. Create one to track your goals!
            </p>
            <Button variant="outline" className="w-full" asChild>
              <LocalizedLink href="/kanban">
                <Plus className="mr-2 h-4 w-4" />
                Create Board
              </LocalizedLink>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
