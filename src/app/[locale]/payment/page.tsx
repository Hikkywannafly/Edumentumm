import BaseLayout from "@/components/layout/base-layout";
import PaymentContent from "@/components/payment/payment-content";
import { setRequestLocale } from "next-intl/server";

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <BaseLayout>
      <PaymentContent />
    </BaseLayout>
  );
}
