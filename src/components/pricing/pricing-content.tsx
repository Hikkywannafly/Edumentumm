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
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function PricingContent() {
  const t = useTranslations("Pricing");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const pricingPlans = [
    {
      id: "free",
      name: t("free.title"),
      price: {
        monthly: t("free.price"),
        yearly: t("free.price"),
      },
      description: t("free.description"),
      features: [
        t("free.features.unlimitedQuizzes"),
        t("free.features.basicAnalytics"),
        t("free.features.upTo5MindMaps"),
        t("free.features.communitySupport"),
      ],
      buttonText: t("free.button"),
      popular: false,
    },
    {
      id: "monthly",
      name: t("pro.title"),
      price: {
        monthly: t("pro.price.monthly"),
        yearly: t("pro.price.yearly"),
      },
      description: t("pro.description"),
      features: [
        t("pro.features.unlimitedQuizzes"),
        t("pro.features.advancedAnalytics"),
        t("pro.features.unlimitedMindMaps"),
        t("pro.features.prioritySupport"),
        t("pro.features.offlineAccess"),
        t("pro.features.customBranding"),
      ],
      buttonText: t("pro.button"),
      popular: true,
    },
    {
      id: "yearly",
      name: t("enterprise.title"),
      price: {
        monthly: t("enterprise.price.monthly"),
        yearly: t("enterprise.price.yearly"),
      },
      description: t("enterprise.description"),
      features: [
        t("enterprise.features.everythingInPro"),
        t("enterprise.features.teamCollaboration"),
        t("enterprise.features.dedicatedManager"),
        t("enterprise.features.customIntegrations"),
        t("enterprise.features.advancedSecurity"),
        t("enterprise.features.slaGuarantee"),
      ],
      buttonText: t("enterprise.button"),
      popular: false,
    },
  ];

  return (
    <WideContainer padding>
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="font-bold text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center">
          <div className="relative inline-flex rounded-full bg-secondary p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBillingCycle("monthly")}
              className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
                billingCycle === "monthly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("billing.monthly")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBillingCycle("yearly")}
              className={`relative z-10 rounded-full px-4 py-2 font-medium text-sm transition-colors ${
                billingCycle === "yearly"
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("billing.yearly")}
              <Badge className="ml-2" variant="secondary">
                {t("billing.save20")}
              </Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing cards */}
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
                <Badge className="bg-primary px-3 py-1">{t("popular")}</Badge>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-center">{plan.name}</CardTitle>
              <div className="mt-4 text-center">
                <span className="font-bold text-4xl">
                  {billingCycle === "monthly"
                    ? plan.price.monthly
                    : plan.price.yearly}
                </span>
                <span className="text-muted-foreground text-sm">
                  {plan.id !== "free" && billingCycle === "monthly"
                    ? `/${t("billing.perMonth")}`
                    : plan.id !== "free"
                      ? `/${t("billing.perYear")}`
                      : ""}
                </span>
              </div>
              <CardDescription className="mt-2 text-center">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mt-0.5 mr-2 h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
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
