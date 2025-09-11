import FeaturesSection from "@/components/landing/features-section";
import BaseLayout from "@/components/layout/base-layout";
import WideContainer from "@/components/layout/wide-layout";
import { ScrollAnimation } from "@/components/motion/scroll-animation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Users } from "lucide-react";
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
          <ScrollAnimation direction="fade" delay={0.2}>
            <Badge variant="secondary" className="mb-4">
              {t("badge")}
            </Badge>
          </ScrollAnimation>
          <ScrollAnimation direction="up" delay={0.4} distance={30}>
            <h1 className="mb-6 font-bold text-4xl tracking-tight md:text-6xl">
              {t("title")}
              <span className="block text-primary">{t("subtitle")}</span>
            </h1>
          </ScrollAnimation>
          <ScrollAnimation direction="up" delay={0.6} distance={30}>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
              {t("description")}
            </p>
          </ScrollAnimation>
          <ScrollAnimation direction="up" delay={0.8} distance={30}>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" className="px-8 text-lg" asChild>
                <Link href={`/${locale}/quizzes`} prefetch>
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
          </ScrollAnimation>
        </div>
      </WideContainer>

      {/* Features Section */}
      <FeaturesSection />
    </BaseLayout>
  );
}
