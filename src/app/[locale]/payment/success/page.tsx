import BaseLayout from "@/components/layout/base-layout";
import PaymentSuccess from "@/components/payment/payment-success";
import { setRequestLocale } from "next-intl/server";

export default async function PaymentSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <BaseLayout>
      <PaymentSuccess />
    </BaseLayout>
  );
}
