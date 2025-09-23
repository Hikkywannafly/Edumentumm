import BaseLayout from "@/components/layout/base-layout";
import PricingContent from "@/components/pricing/pricing-content";
import { setRequestLocale } from "next-intl/server";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <BaseLayout>
      <PricingContent />
    </BaseLayout>
  );
}
