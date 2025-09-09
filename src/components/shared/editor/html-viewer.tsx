"use client";

import { cn } from "@/lib/utils";

interface HtmlViewerProps {
  content: string;
  className?: string;
}

export function HtmlViewer({ content, className }: HtmlViewerProps) {
  return (
    <div
      className={cn("prose max-w-none", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: This component is specifically designed for rendering sanitized HTML content
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
