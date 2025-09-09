"use client";

import { Button } from "@/components/ui/button";
import type { QuizHeaderProps } from "@/types/quiz-take";
import { Copy, Link } from "lucide-react";
import TiptapEditor from "../../shared/editor/tiptap-editor";

export function QuizHeader({
  title,
  currentQuestion,
  totalQuestions,
}: QuizHeaderProps) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex-1" />
            <TiptapEditor
              content={title}
              onChange={() => {}}
              showToolbar={false}
              className="font-medium text-gray-900 text-lg dark:text-white"
            />
            <div className="flex flex-1 items-center justify-end gap-3">
              <span className="font-medium text-gray-900 text-sm dark:text-white">
                {currentQuestion + 1} / {totalQuestions}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mx-auto w-full max-w-md">
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
