"use client";

import { useQuizNavigationContext } from "@/contexts/quiz-navigation-context";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { QuizExitConfirmationDialog } from "./quiz-exit-confirmation-dialog";

export function QuizNavigationGuard() {
  const { showNavigationWarning } = useQuizNavigationContext();
  const router = useRouter();
  const { goBack } = useLocalizedNavigation();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const pendingNavigationRef = useRef<string | null>(null);

  useEffect(() => {
    const handleWindowNavigation = (e: BeforeUnloadEvent) => {
      if (showNavigationWarning()) {
        e.preventDefault();
        return "You have unsaved progress. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleWindowNavigation);

    return () => {
      window.removeEventListener("beforeunload", handleWindowNavigation);
    };
  }, [showNavigationWarning]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && showNavigationWarning()) {
        const href = link.getAttribute("href");
        if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
          const isExternal =
            link.hasAttribute("target") &&
            link.getAttribute("target") === "_blank";
          const isDownload = link.hasAttribute("download");
          if (!isExternal && !isDownload) {
            const isInternalNavigation =
              !href.startsWith("http") &&
              !href.startsWith("//") &&
              !href.startsWith("mailto:") &&
              !href.startsWith("tel:");

            if (isInternalNavigation) {
              // Prevent default navigation
              e.preventDefault();

              // Store the intended navigation
              pendingNavigationRef.current = href;

              // Show confirmation dialog
              setShowExitDialog(true);
            }
          }
        }
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [showNavigationWarning]);

  const handleConfirmExit = () => {
    setShowExitDialog(false);

    // Navigate to the pending URL or go back if none
    if (pendingNavigationRef.current) {
      router.push(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    } else {
      goBack();
    }
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
    pendingNavigationRef.current = null;
  };

  return (
    <QuizExitConfirmationDialog
      isOpen={showExitDialog}
      onClose={handleCancelExit}
      onConfirm={handleConfirmExit}
      onCancel={handleCancelExit}
    />
  );
}
