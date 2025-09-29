"use client";

import WideContainer from "@/components/layout/wide-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { subscriptionAPI } from "@/lib/api/subscription";
import { Check, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PricingContent() {
  const t = useTranslations("Pricing");
  const router = useRouter();
  const locale = useLocale();
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check subscription status on component mount
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const status = await subscriptionAPI.getSubscriptionStatus();
        setHasActiveSubscription(status.hasActiveSubscription);
      } catch (error) {
        console.error("Failed to check subscription status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  // Define features based on locale for proper internationalization
  const freeFeatures =
    locale === "vi"
      ? [
          "3 bài kiểm tra mỗi tuần",
          "3 bộ flashcard mỗi tuần",
          "Lên đến 20 câu hỏi mỗi bài kiểm tra",
          "Lên đến 15 flashcard mỗi bộ",
          "Tải lên PDF & Tài liệu (giới hạn 20MB)",
          "Tải lên liên kết",
          "Tải lên Google Drive",
          "Bộ hẹn giờ Pomodoro",
          "Bảng Kanban",
          "Tải lên hình ảnh",
          "Tải lên video YouTube",
        ]
      : [
          "3 quizzes per week",
          "3 flashcard sets per week",
          "Up to 20 questions per quiz",
          "Up to 15 flashcards per set",
          "PDF & Document uploads (20MB limit)",
          "Link uploads",
          "Google Drive uploads",
          "Pomodoro Timer",
          "Kanban Board",
          "Image uploads",
          "YouTube video uploads",
        ];

  const proFeatures =
    locale === "vi"
      ? [
          "Không giới hạn bài kiểm tra",
          "Không giới hạn bộ flashcard",
          "Lên đến 60 câu hỏi mỗi bài kiểm tra",
          "Lên đến 60 flashcard mỗi bộ",
          "Tải lên PDF & Tài liệu (giới hạn 50MB)",
          "Tải lên liên kết",
          "Tải lên Google Drive",
          "Bộ hẹn giờ Pomodoro",
          "Bảng Kanban",
          "Tải lên hình ảnh",
          "Tải lên video YouTube",
          "Tạo AI ưu tiên",
          "Hỗ trợ ưu tiên",
        ]
      : [
          "Unlimited quizzes",
          "Unlimited flashcard sets",
          "Up to 60 questions per quiz",
          "Up to 60 flashcards per set",
          "PDF & Document uploads (50MB limit)",
          "Link uploads",
          "Google Drive uploads",
          "Pomodoro Timer",
          "Kanban Board",
          "Image uploads",
          "YouTube video uploads",
          "Priority AI generation",
          "Priority support",
        ];

  const pricingPlans = [
    {
      id: "free",
      name: t("free.title"),
      price: t("free.price"),
      period: t("billing.perMonth"),
      description: t("free.description"),
      features: freeFeatures,
      buttonText: t("free.button"),
      popular: false,
      priceValue: 0,
    },
    {
      id: "monthly",
      name: `${t("pro.title")} ${t("billing.monthly")}`,
      price: "$5.00",
      period: t("billing.perMonth"),
      description: t("pro.description"),
      features: proFeatures,
      buttonText: t("pro.button"),
      popular: false,
      priceValue: 5,
    },
    {
      id: "yearly",
      name: `${t("pro.title")} ${t("billing.yearly")}`,
      price: "$2.50",
      period: t("billing.perMonth"),
      description: t("pro.description"),
      features: proFeatures,
      buttonText: t("pro.button"),
      popular: true,
      priceValue: 2.5,
      originalPrice: "$30.00",
      billedAnnually: "$60.00 billed annually",
    },
  ];

  const handlePlanSelect = (planId: string) => {
    if (planId === "free") {
      router.push(`/${locale}/dashboard`);
    } else {
      router.push(`/${locale}/payment`);
    }
  };

  if (loading) {
    return (
      <WideContainer padding>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </WideContainer>
    );
  }

  if (hasActiveSubscription) {
    return (
      <WideContainer padding>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="font-bold text-3xl md:text-4xl">
            Bạn đang sử dụng gói Pro!
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Cảm ơn bạn đã nâng cấp. Bạn đang tận hưởng tất cả các tính năng Pro.
          </p>
          <Button
            className="mt-8"
            onClick={() => router.push(`/${locale}/dashboard`)}
          >
            Trở về bảng điều khiển
          </Button>
        </div>
      </WideContainer>
    );
  }

  return (
    <WideContainer padding>
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-bold text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Pricing cards - showing all three plans */}
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col ${
              plan.popular ? "border-primary ring-2 ring-primary/20" : ""
            }`}
          >
            {plan.popular && (
              <div className="-top-3 -translate-x-1/2 absolute left-1/2">
                <Badge className="flex items-center gap-1 bg-primary px-3 py-1">
                  <Star className="h-3 w-3 fill-current" />
                  {t("popular")}
                </Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-center">{plan.name}</CardTitle>
              <div className="mt-4 text-center">
                <span className="font-bold text-4xl">{plan.price}</span>
                <span className="text-muted-foreground text-sm">
                  {plan.period ? `/${plan.period}` : ""}
                </span>
                {plan.originalPrice && (
                  <div className="mt-1">
                    <span className="text-muted-foreground text-sm line-through">
                      {plan.originalPrice}
                    </span>
                  </div>
                )}
                {plan.billedAnnually && (
                  <div className="text-muted-foreground text-sm">
                    {plan.billedAnnually}
                  </div>
                )}
              </div>
              <CardDescription className="mt-2 text-center">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ section */}
      <div className="mt-24">
        <h2 className="text-center font-bold text-2xl md:text-3xl">
          {t("faq.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("faq.subtitle")}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-lg border p-6">
              <h3 className="font-semibold">
                {t(`faq.questions.${item}.question`)}
              </h3>
              <p className="mt-2 text-muted-foreground text-sm">
                {t(`faq.questions.${item}.answer`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </WideContainer>
  );
}
