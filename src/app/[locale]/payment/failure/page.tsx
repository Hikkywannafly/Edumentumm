import BaseLayout from "@/components/layout/base-layout";
import PaymentFailure from "@/components/payment/payment-failure";
import { setRequestLocale } from "next-intl/server";

export default async function PaymentFailurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <BaseLayout>
      <PaymentFailure />
    </BaseLayout>
  );
}
