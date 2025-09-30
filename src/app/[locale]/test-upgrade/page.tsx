import BaseLayout from "@/components/layout/base-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import { ResponsivePageWrapper } from "@/components/layout/responsive-page-wrapper";
import { setRequestLocale } from "next-intl/server";

export default async function TestUpgradePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <BaseLayout>
      <ResponsivePageWrapper>
        <PageHeaderClient title="Test Upgrade Page" showUpgradeButton={true} />
        <div className="p-8">
          <h2 className="font-bold text-2xl">Test Page with Upgrade Button</h2>
          <p className="mt-4">
            This page demonstrates the upgrade button in the header. The button
            should have animations and a crown icon.
          </p>
        </div>
      </ResponsivePageWrapper>
    </BaseLayout>
  );
}
