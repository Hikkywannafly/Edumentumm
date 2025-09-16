"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { PageHeaderClient } from "@/components/layout/page-header-client";
import ThinLayout from "@/components/layout/thin-layout";
import { QuizResultsContent } from "@/components/quizzes/results/quiz-results-content";
import { Button } from "@/components/ui/button";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { ArrowLeft } from "lucide-react";

export default function QuizResultsPage() {
  const { goBack } = useLocalizedNavigation();

  const handleBack = () => {
    goBack();
  };

  return (
    <DashboardLayout>
      <PageHeaderClient
        title="Quiz Results"
        action={
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
        showThemeToggle={true}
        showLanguageSwitcher={true}
      />
      <ThinLayout>
        <QuizResultsContent />
      </ThinLayout>
    </DashboardLayout>
  );
}
