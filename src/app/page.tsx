import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const headersList = await headers();
  const cookieStore = await cookies();

  // Check for saved locale in cookie
  const savedLocale = cookieStore.get("edumentum-locale")?.value;

  if (savedLocale === "en" || savedLocale === "vi") {
    redirect(`/${savedLocale}`);
  }

  // Fallback to accept-language header
  const acceptLanguage = headersList.get("accept-language") || "";
  const prefersEnglish =
    acceptLanguage.includes("en") && !acceptLanguage.includes("vi");

  // Redirect to preferred locale
  redirect(prefersEnglish ? "/en" : "/vi");
}
