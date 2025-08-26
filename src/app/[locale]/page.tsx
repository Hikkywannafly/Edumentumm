import BaseLayout from "@/components/layout/base-layout";
import WideContainer from "@/components/layout/wide-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Lightbulb, Play, Target, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");

  return (
    <BaseLayout>
      {/* Hero Section */}
      <WideContainer padding>
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            {t("badge")}
          </Badge>
          <h1 className="mb-6 font-bold text-4xl tracking-tight md:text-6xl">
            {t("title")}
            <span className="block text-primary">{t("subtitle")}</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
            {t("description")}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" className="px-8 text-lg" asChild>
              <Link href={`/${locale}/quizzes`}>
                <Play className="mr-2 h-5 w-5" />
                {t("startLearning")}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 text-lg"
              asChild
            >
              <Link href={`/${locale}/login`}>
                <Users className="mr-2 h-5 w-5" />
                {t("joinCommunity")}
              </Link>
            </Button>
          </div>
        </div>
      </WideContainer>

      {/* Features Section */}
      <WideContainer padding>
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>{t("features.personalized.title")}</CardTitle>
              <CardDescription>
                {t("features.personalized.description")}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>{t("features.ai.title")}</CardTitle>
              <CardDescription>{t("features.ai.description")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>{t("features.exams.title")}</CardTitle>
              <CardDescription>
                {t("features.exams.description")}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </WideContainer>
    </BaseLayout>
  );
}
