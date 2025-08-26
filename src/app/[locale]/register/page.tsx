import RegisterForm from "@/components/auth/register-form";
import { BaseLayout } from "@/components/layout";
import WideContainer from "@/components/layout/wide-layout";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("RegisterPage");

  return (
    <BaseLayout>
      <WideContainer>
        <div className="flex min-h-screen flex-col md:flex-row">
          <div className="flex flex-1 flex-col justify-center px-12 py-16">
            <div className="max-w-lg">
              <h1 className="mb-8 font-bold text-4xl leading-tight">
                {t("title")} <br />
                <span className="text-blue-600 ">Edumentum</span>
              </h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex w-full items-center justify-center px-6 py-12 sm:px-10 md:w-1/2 md:px-12 md:py-16">
            <RegisterForm />
          </div>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
