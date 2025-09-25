"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import PaymentContent from "../../../components/payment/payment-content";

export default function PaymentPage() {
  return (
    <DashboardLayout>
      {/* Header */}
      <PageHeaderClient title="Pomodoro" showThemeToggle={true} />

      {/* Main content */}
      <PaymentContent />
    </DashboardLayout>
  );
}
