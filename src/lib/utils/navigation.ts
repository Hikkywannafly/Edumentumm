import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

/**
 * Hook to handle navigation with locale support
 */
export function useLocalizedNavigation() {
  const router = useRouter();
  const locale = useLocale();

  /**
   * Navigate to route with locale
   */
  const navigate = (path: string) => {
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
  const goQuizEdit = () => {
    navigate("/quizzes/edit");
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

  return {
    navigate,
    navigateAbsolute,
    goBack,
    goHome,
    goDashboard,
    goQuizzes,
    goLogin,
    goQuizEdit,
    goFlashcardEdit,
    goFlashcards,
    goPomodoro,
    locale,
  };
}

/**
 * Utility function để tạo localized href
 */
export function createLocalizedHref(href: string, locale?: string): string {
  const currentLocale = locale || "en"; // fallback to 'en'
  const cleanHref = href.startsWith("/") ? href : `/${href}`;
  return `/${currentLocale}${cleanHref}`;
}
