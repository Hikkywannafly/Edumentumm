import { getLocaleFromPathname } from "@/lib/utils";
import { useRouter } from "next/navigation";

/**
 * Hook to handle navigation with locale support
 */
export function useLocalizedNavigation() {
  const router = useRouter();

  /**
   * Navigate to route with locale
   */
  const navigate = (path: string) => {
    // Get current locale from window location
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const locale = getLocaleFromPathname(currentPath) || "en";

    const localizedPath = path.startsWith("/") ? path : `/${path}`;
    router.push(`/${locale}${localizedPath}`);
  };

  /**
   * Navigate to route without locale (absolute path)
   */
  const navigateAbsolute = (path: string) => {
    router.push(path);
  };

  /**
   * Navigate to previous page
   */
  const goBack = () => {
    router.back();
  };

  /**
   * Navigate to home page
   */
  const goHome = () => {
    navigate("/");
  };

  /**
   * Navigate to home group
   */
  const goGroup = () => {
    navigate("/group");
  };

  /**
   * Navigate to dashboard
   */
  const goDashboard = () => {
    navigate("/dashboard");
  };

  /**
   * Navigate to quizzes page
   */
  const goQuizzes = () => {
    navigate("/quizzes");
  };

  /**
   * Navigate to login page
   */
  const goLogin = () => {
    navigate("/login");
  };

  /**
   * Navigate to quiz edit page
   */
  const goQuizEdit = (quizId?: string | number, slug?: string) => {
    // Get current locale from window location
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";
    const locale = getLocaleFromPathname(currentPath) || "en";

    if (quizId && slug) {
      const path = `/quizzes/${slug}-${quizId}/edit`;
      // Use replace to prevent back navigation to create page
      router.replace(`/${locale}${path}`);
    } else if (quizId) {
      // Fallback if slug is not provided
      const path = `/quizzes/${quizId}/edit`;
      router.replace(`/${locale}${path}`);
    } else {
      router.replace(`/${locale}/quizzes/edit`);
    }
  };

  /**
   * Navigate to flashcard edit page
   */
  const goFlashcardEdit = () => {
    navigate("/flashcards/edit");
  };

  /**
   * Navigate to flashcards page
   */
  const goFlashcards = () => {
    navigate("/flashcards");
  };

  /**
   * Navigate to pomodoro page
   */
  const goPomodoro = () => {
    navigate("/pomodoro");
  };

  /**
   * Navigate to pricing page
   */
  const goPricing = () => {
    navigate("/pricing");
  };

  return {
    navigate,
    navigateAbsolute,
    goBack,
    goHome,
    goGroup,
    goDashboard,
    goQuizzes,
    goLogin,
    goQuizEdit,
    goFlashcardEdit,
    goFlashcards,
    goPomodoro,
    goPricing,
  };
}

/**
 * Utility function to create localized href
 */
export function createLocalizedHref(href: string, locale?: string): string {
  // If no locale provided, try to get it from window location
  const currentLocale =
    locale ||
    (typeof window !== "undefined"
      ? getLocaleFromPathname(window.location.pathname)
      : "en");

  // Ensure href starts with a slash
  const cleanHref = href.startsWith("/") ? href : `/${href}`;
  return `/${currentLocale}${cleanHref}`;
}
