"use client";

import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";

interface HtmlTitleProps {
  content: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

export function HtmlTitle({
  content,
  className,
  as: Tag = "h3",
}: HtmlTitleProps) {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "u", "span", "br"],
    ALLOWED_ATTR: ["class", "style"],
  });

  // Remove all HTML tags to get plain text for accessibility
  const plainText = sanitizedContent.replace(/<[^>]*>/g, "");

  return (
    <Tag
      className={cn("max-w-none", className)}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized with DOMPurify
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      title={plainText} // For accessibility
    />
  );
}
