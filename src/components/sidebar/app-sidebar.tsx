"use client";

import {
  Archive,
  BookOpen,
  BookText,
  BrainCircuit,
  Calendar,
  ChevronDown,
  Compass,
  CreditCard,
  FolderOpen,
  GraduationCap,
  Group,
  HelpCircle,
  Home,
  Pin,
  PinOff,
  StickyNote,
  Timer,
  Trello,
  Users,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSidebarContext } from "@/contexts/sidebar-context";
import { usePrefetchQuizList } from "@/hooks/quiz/use-quiz-list";
import { useTranslations } from "next-intl";
import { LocalizedLink } from "../localized-link";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  badge?: string;
};

type MenuData = {
  [key: string]: MenuItem[];
};

export function AppSidebar() {
  const t = useTranslations("Navigation");
  const {
    isPinned,
    isHovered,
    isMobileOpen,
    setIsPinned,
    setIsHovered,
    setIsMobileOpen,
    isExpanded,
    isMobile,
  } = useSidebarContext();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const prefetchQuizList = usePrefetchQuizList();

  // Menu data with translations and improved icons
  const menuData: MenuData = {
    overview: [
      {
        title: t("dashboard"),
        url: "/dashboard",
        icon: Home,
      },
      {
        title: t("explore"),
        url: "/explore",
        icon: Compass,
      },
    ],
    contentCreation: [
      {
        title: t("materials"),
        url: "/materials",
        icon: BookOpen,
      },
      {
        title: t("quizzes"),
        url: "/quizzes",
        icon: HelpCircle,
      },
      {
        title: t("flashcards"),
        url: "/flashcards",
        icon: CreditCard,
      },
      {
        title: t("collections"),
        url: "/collections",
        icon: FolderOpen,
      },
    ],
    studyTools: [
      {
        title: t("notes"),
        url: "/notes",
        icon: StickyNote,
      },
      {
        title: t("mindMap"),
        url: "/mindmap",
        icon: BrainCircuit,
      },
      {
        title: t("reader"),
        url: "/reader",
        icon: BookText,
        badge: "New",
      },
      {
        title: t("tutors"),
        url: "/tutors",
        icon: Users,
        badge: "Beta",
      },
      {
        title: t("pomodoro"),
        url: "/pomodoro",
        icon: Timer,
      },
    ],
    planning: [
      {
        title: t("planner"),
        url: "/planner",
        icon: Calendar,
      },
      {
        title: t("kanbanBoard"),
        url: "/kanban",
        icon: Trello,
      },
    ],
    socialprogress: [
      {
        title: t("course"),
        url: "/course",
        icon: GraduationCap,
      },
      {
        title: t("studyGroup"),
        url: "/group",
        icon: Group,
      },
      {
        title: t("achievements"),
        url: "/achievements",
        icon: Archive,
      },
    ],
  };

  // Suppress ResizeObserver errors
  React.useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (
        e.message.includes(
          "ResizeObserver loop completed with undelivered notifications",
        )
      ) {
        e.stopImmediatePropagation();
        return false;
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  const handlePinToggle = React.useCallback(() => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    // Save to localStorage
    localStorage.setItem("sidebar-pinned", JSON.stringify(newPinned));
  }, [isPinned, setIsPinned]);

  const handleMouseEnter = React.useCallback(() => {
    if (!isPinned && !isMobile) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsHovered(true);
    }
  }, [isPinned, setIsHovered, isMobile]);

  const handleMouseLeave = React.useCallback(() => {
    if (!isPinned && !isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 100);
    }
  }, [isPinned, setIsHovered, isMobile]);

  // Close mobile sidebar when clicking outside
  const handleOverlayClick = React.useCallback(() => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen, setIsMobileOpen]);

  // Handle keyboard events for mobile
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    if (isMobile && isMobileOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, isMobileOpen, setIsMobileOpen]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleQuizMenuHover = () => {
    // Prefetch quiz data when user hovers over the quizzes menu item
    prefetchQuizList({
      page: 0,
      size: 10,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  };

  // Close mobile sidebar when a link is clicked
  const handleLinkClick = React.useCallback(() => {
    if (isMobile && isMobileOpen) {
      setIsMobileOpen(false);
    }
  }, [isMobile, isMobileOpen, setIsMobileOpen]);

  const textVisibility = isExpanded
    ? "opacity-100"
    : "opacity-0 w-0 overflow-hidden";

  const iconVisibility = isExpanded
    ? "opacity-100 w-3"
    : "opacity-0 w-0 overflow-hidden";

  // Function to get translated section titles
  const getSectionTitle = (key: string) => {
    switch (key) {
      case "overview":
        return t("overview");
      case "contentCreation":
        return t("contentCreation");
      case "studyTools":
        return t("studyTools");
      case "planning":
        return t("planning");
      case "socialprogress":
        return t("socialProgress");
      default:
        return key;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={handleOverlayClick}
        />
      )}

      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 ${
          isMobile
            ? `z-50 w-64 transform transition-transform duration-300 ease-in-out ${
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `z-90 ${
                isPinned ? "w-64" : isHovered ? "w-64" : "w-16"
              } ${!isPinned ? "transition-all duration-200 ease-in-out" : ""}`
        }`}
      >
        <div className="flex h-full flex-col border-gray-200 border-r bg-white dark:border-gray-700 dark:bg-gray-900">
          {/* Header */}
          <div className="h-16 flex-shrink-0 border-gray-200 border-b dark:border-gray-700">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span
                  className={`font-semibold text-lg transition-opacity duration-200 ${textVisibility}`}
                >
                  Edumentum
                </span>
              </div>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-6 w-6 transition-opacity duration-200 hover:opacity-100 ${textVisibility}`}
                  onClick={handlePinToggle}
                  title={isPinned ? t("unpinSidebar") : t("pinSidebar")}
                >
                  {isPinned ? (
                    <Pin className="h-4 w-4 text-blue-600" />
                  ) : (
                    <PinOff className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div
            className={`flex-1 overflow-y-auto px-2 py-2 ${
              isMobile
                ? "custom-scrollbar"
                : isExpanded
                  ? "custom-scrollbar"
                  : "custom-scrollbar-hidden"
            }`}
          >
            {Object.entries(menuData).map(([key, items]) => (
              <Collapsible key={key} defaultOpen className="group/collapsible">
                <div className="relative flex w-full min-w-0 flex-col p-2">
                  <CollapsibleTrigger className="flex w-full items-center justify-between px-2 py-2 font-medium text-gray-500 text-xs hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                    <span
                      className={`transition-opacity duration-200 ${textVisibility}`}
                    >
                      {getSectionTitle(key)}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 transition-all duration-200 group-data-[state=open]/collapsible:rotate-180 ${iconVisibility}`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="w-full text-sm">
                      <ul className="flex w-full min-w-0 flex-col gap-1">
                        {items.map((item) => (
                          <li
                            key={item.title}
                            className="group/menu-item relative"
                          >
                            <div title={!isExpanded ? item.title : undefined}>
                              <LocalizedLink
                                href={item.url}
                                className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none transition-[width,height,padding] hover:bg-gray-100 focus-visible:ring-2 active:bg-gray-100 dark:active:bg-gray-800 dark:hover:bg-gray-800"
                                prefetch={
                                  item.url === "/quizzes" ? true : undefined
                                }
                                onMouseEnter={
                                  item.url === "/quizzes"
                                    ? handleQuizMenuHover
                                    : undefined
                                }
                                onClick={handleLinkClick}
                              >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span
                                  className={`transition-opacity duration-200 ${textVisibility}`}
                                >
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span
                                    className={`rounded-full bg-blue-500 px-2 py-0.5 text-white text-xs transition-opacity duration-200 ${textVisibility}`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </LocalizedLink>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
