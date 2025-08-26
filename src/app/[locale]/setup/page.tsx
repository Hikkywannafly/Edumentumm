import { Setup } from "@/components/auth/setup";
import { BaseLayout } from "@/components/layout";
import { setRequestLocale } from "next-intl/server";

export default async function SetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <BaseLayout showHeader={false} showFooter={false}>
      <Setup />
    </BaseLayout>
  );
}
