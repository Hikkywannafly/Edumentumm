import LoginForm from "@/components/auth/login-form";
import { BaseLayout } from "@/components/layout";
import WideContainer from "@/components/layout/wide-layout";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("LoginPage");

  return (
    <BaseLayout>
      <WideContainer>
        <div className="flex min-h-screen flex-col md:flex-row">
          {/* Left side */}
          <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 md:w-1/2 md:px-12 md:py-16">
            <div className="mx-auto max-w-lg md:mx-0">
              <h1 className="mb-8 font-bold text-3xl leading-tight sm:text-4xl">
                {t("title")}
                <br />
                <span className="text-blue-600 ">{t("subtitle")}</span>
              </h1>
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-400">
                  {t("feature.roadmap")}
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-400 dark:bg-green-900 dark:text-green-400">
                  {t("feature.personalize")}
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-purple-800 dark:border-purple-400 dark:bg-purple-900 dark:text-purple-400">
                  {t("feature.community")}
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex w-full items-center justify-center px-6 py-12 sm:px-10 md:w-1/2 md:px-12 md:py-16">
            <LoginForm />
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
