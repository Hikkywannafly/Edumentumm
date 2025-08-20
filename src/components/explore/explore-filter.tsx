"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";
import { useState } from "react";
import { Card } from "../ui";

export default function ExploreFilter() {
  const [tab, setTab] = useState("quizzes");

  return (
    <Card className="w-full border-none py-6">
      <div className="flex w-full flex-col gap-4">
        {/* Tabs - Full Width */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="quizzes"
              className="w-full dark:data-[state=active]:bg-blue-500"
            >
              Quizzes
            </TabsTrigger>
            <TabsTrigger
              value="flashcards"
              className="w-full dark:data-[state=active]:bg-blue-500"
            >
              Flashcards
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search + Sort - Full Width Responsive */}
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search Input - Full Width on Mobile, Flexible on Desktop */}
          <div className="flex-1">
            <Input placeholder="Search..." className="w-full" />
          </div>

          {/* Sort Dropdown - Full Width on Mobile, Fixed Width on Desktop */}
          <div className="w-full sm:w-auto sm:min-w-[140px]">
            <Select defaultValue="newest">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Oldest
                  </div>
                </SelectItem>
                <SelectItem value="title-a-z">Title A-Z</SelectItem>
                <SelectItem value="title-z-a">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
}
