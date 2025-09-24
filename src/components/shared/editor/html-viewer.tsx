"use client";

import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface HtmlViewerProps {
  content: string;
  className?: string;
}

export function HtmlViewer({ content, className }: HtmlViewerProps) {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div
      className={cn("prose max-w-none", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
