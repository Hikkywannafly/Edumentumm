"use client";

import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";

interface ChatHeaderProps {
  name?: string;
  setClose: () => void;
}

export function ChatHeader({ name, setClose }: ChatHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between bg-primary p-3 text-primary-foreground">
      <span className="font-semibold">
        {" "}
        {`Channel [${name}]` || "Group Chat"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={setClose}
        className="h-7 w-7 rounded-full hover:bg-primary/80"
      >
        <X className="h-4 w-4" />
      </Button>
    </CardHeader>
  );
}
