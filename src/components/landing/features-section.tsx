"use client";

import { StudyGroupCard } from "@/components/group/study-group-card";
import WideContainer from "@/components/layout/wide-layout";
import {
  ScrollAnimation,
  StaggerAnimation,
} from "@/components/motion/scroll-animation";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GroupResponse } from "@/types/group";
import {
  Eye,
  FileText,
  Hash,
  HelpCircle,
  Languages,
  Lightbulb,
  Pencil,
  Rss,
  Target,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "../ui";
import LandingPomodoro from "./landing-pomodoro";

export default function FeaturesSection() {
  const t = useTranslations("HomePage");
  const mockStudyGroups: GroupResponse[] = [
    {
      id: 1,
      name: "Algorithms Sprint",
      description: "Daily LeetCode discussion and mock interviews.",
      memberLimit: 20,
      ownerId: 101,
      ownerName: "Alice",
      memberCount: 12,
      key: "algos-101",
      createdAt: new Date().toISOString(),
      public: true,
    },
    {
      id: 2,
      name: "IELTS 7.0+ Prep",
      description: "Speaking rooms and weekly writing reviews.",
      memberLimit: 30,
      ownerId: 102,
      ownerName: "Bob",
      memberCount: 18,
      key: "ielts-advanced",
      createdAt: new Date().toISOString(),
      public: false,
    },
    {
      id: 3,
      name: "Operating Systems",
      description: "Exam-focused study with past papers and quizzes.",
      memberLimit: 25,
      ownerId: 103,
      ownerName: "Carol",
      memberCount: 9,
      key: "os-review",
      createdAt: new Date().toISOString(),
      public: true,
    },
  ];

  return (
    <WideContainer padding id="features">
      <ScrollAnimation direction="up" distance={30}>
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-bold text-3xl md:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            {t("featuresSubtitle")}
          </p>
        </div>
      </ScrollAnimation>

      <StaggerAnimation direction="up" distance={50} staggerDelay={0.2}>
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
      </StaggerAnimation>

      {/* Section lead above the two columns */}
      <ScrollAnimation direction="up" distance={30}>
        <div className="mt-16 text-center">
          <span className="mb-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-sm text-white">
            <Lightbulb className="h-4 w-4" />
            <span>{t("features.detail.note")}</span>
          </span>
          <div className="flex w-full flex-col items-center justify-center">
            <h2 className="max-w-3xl font-bold text-3xl tracking-tight sm:text-4xl">
              {t("features.detail.title")}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-muted-foreground">
              {t("features.detail.subtitle")}
            </p>
          </div>
        </div>
      </ScrollAnimation>

      <div className="mt-16 grid gap-16 md:mt-32 md:grid-cols-2 md:gap-0">
        <ScrollAnimation direction="left" distance={50}>
          <div className="col-span-1">
            <div className="relative mx-auto h-auto w-2/3 md:w-1/2">
              <div className="relative mb-8">
                <div className="relative h-48 w-full rounded-lg border-2 border-gray-300 border-dashed p-6 transition-colors hover:border-gray-400">
                  <div className="flex h-full flex-col items-center justify-center">
                    <div className="relative mb-4">
                      <div className="flex h-16 w-12 items-center justify-center rounded bg-white shadow-md">
                        <div className="h-8 w-6 rounded-sm bg-gray-200" />
                      </div>
                      <div className="-right-1 -top-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-gray-600">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="-bottom-1 -left-1 absolute flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                        <svg
                          className="h-2 w-2 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2">
                      <div className="relative">
                        <div className="h-6 w-4 rounded-sm bg-white shadow-lg">
                          <div className="-right-1 absolute top-0 h-2 w-2 rounded-full bg-gray-800" />
                          <div className="-right-1 absolute top-1 h-1 w-1 rounded-full bg-gray-800" />
                          <div className="-right-1 absolute top-2 h-1 w-1 rounded-full bg-gray-800" />
                          <div className="-right-1 absolute top-3 h-1 w-1 rounded-full bg-gray-800" />
                        </div>
                      </div>
                    </div>

                    <p className="text-center font-medium text-gray-600 text-sm">
                      {t("features.detail.quizzes.featDrop")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10 mb-4 transform rounded-xl bg-blue-500 p-4 shadow-lg">
                  <p className="font-medium text-sm text-white">
                    Which tree structure guarantees that data is sorted and
                    allows for efficient searching?
                  </p>
                </div>

                <div className="absolute top-8 left-2 z-0 transform rounded-xl bg-blue-400 p-4 shadow-lg">
                  <p className="font-medium text-sm text-white">
                    Which tree structure guarantees that data is sorted and
                    allows for efficient searching?
                  </p>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-16 w-full text-balance text-center md:w-4/5">
              <p className="font-semibold text-lg">
                {t("features.detail.quizzes.title1")}
              </p>
              <p className="text- mt-4 text-muted-foreground">
                {t("features.detail.quizzes.subtitle1")}
              </p>
            </div>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="right" distance={50}>
          <div className="col-span-1">
            <div className="relative mx-auto w-2/3 after:absolute after:bottom-0 after:left-0 after:h-32 after:w-full after:bg-gradient-to-t after:from-background after:to-transparent after:content-['']">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 font-medium text-sm">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    Visibility
                  </Label>
                  <Select defaultValue="public">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="flex items-center gap-2 font-medium text-sm">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    Language of the quiz
                  </Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Auto detect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto detect</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="vi">Vietnamese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question type */}
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 font-medium text-sm">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    Question type
                  </Label>
                  <Select defaultValue="mixed">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple choice</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="tf">True/False</SelectItem>
                      <SelectItem value="fb">Fill in the blank</SelectItem>
                      <SelectItem value="fr">Free response</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Number of questions */}
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 font-medium text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    Number of questions
                  </Label>
                  <Select defaultValue="5-10">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-10">5-10</SelectItem>
                      <SelectItem value="10-20">10-20</SelectItem>
                      <SelectItem value="20-30">20-30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode */}
                <div className="space-y-1">
                  <Label className="flex items-center gap-2 font-medium text-sm">
                    <Rss className="h-4 w-4 text-muted-foreground" />
                    Mode
                  </Label>
                  <Select defaultValue="exam">
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="practice">Practice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-6 w-full text-balance text-center md:w-4/5">
              <p className="font-semibold text-lg">
                {t("features.detail.quizzes.title2")}
              </p>
              <p className="mt-4 text-muted-foreground">
                {t("features.detail.quizzes.subtitle2")}
              </p>
            </div>
          </div>
        </ScrollAnimation>
      </div>
      <div className="mt-16 grid gap-16 md:mt-32 md:grid-cols-2 md:gap-0">
        <ScrollAnimation direction="left" distance={50}>
          <div className="col-span-1 flex flex-col items-center">
            <div className="relative h-[350px] w-96">
              {mockStudyGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="hover:-translate-y-2 absolute inset-0 transition-all duration-300 hover:z-10"
                  style={{
                    transform: `translate(${index * 50}px, ${index * 60}px)`,
                    zIndex: index,
                  }}
                >
                  <StudyGroupCard iStudyGroupCard={group} />
                </div>
              ))}
            </div>
            <div className="w-full text-center md:w-4/5">
              <p className="font-semibold text-lg">
                {t("features.detail.studyGroup.title")}
              </p>
              <p className="mt-4 text-muted-foreground">
                {t("features.detail.studyGroup.subTitle")}
              </p>
            </div>
          </div>
        </ScrollAnimation>
        <ScrollAnimation direction="right" distance={50}>
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Mind Map Container */}
              <div className="relative h-96 w-full overflow-hidden rounded-lg p-8 shadow-lg">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #9ca3af 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>
                {/* Mind Map Nodes */}
                <div className="relative h-full w-full">
                  {/* Root Node - Mind map */}
                  <div className="-translate-x-1/2 absolute top-8 left-1/2 transform">
                    <div className="flex h-16 w-32 items-center justify-center rounded-lg border-2 border-gray-300 bg-red-500 px-4 py-2 shadow-md">
                      <span className="font-semibold text-sm text-white">
                        Mind map
                      </span>
                    </div>
                    {/* Connection points */}
                    <div className="-bottom-1 -translate-x-1/2 absolute left-1/2 h-2 w-2 rounded-full bg-gray-400" />
                    <div className="-top-1 -translate-x-1/2 absolute left-1/2 h-2 w-2 rounded-full bg-gray-400" />
                  </div>
                  {/* Node 1 */}
                  <div className="absolute top-32 left-16">
                    <div className="flex h-12 w-20 items-center justify-center rounded-lg border-2 border-gray-300 bg-purple-200 px-3 py-2 shadow-md">
                      <span className="font-medium text-gray-700 text-xs">
                        Node 1
                      </span>
                    </div>
                    {/* Connection line to root */}
                    <svg
                      className="-top-8 -translate-x-1/2 absolute left-1/2 h-8 w-8 transform"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M50 0 Q25 25 50 50"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead)"
                      />
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  {/* Node 2 */}
                  <div className="absolute top-32 right-16">
                    <div className="flex h-12 w-20 items-center justify-center rounded-lg border-2 border-gray-300 bg-green-200 px-3 py-2 shadow-md">
                      <span className="font-medium text-gray-700 text-xs">
                        Node 2
                      </span>
                    </div>
                    {/* Connection line to root */}
                    <svg
                      className="-top-8 -translate-x-1/2 absolute left-1/2 h-8 w-8 transform"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M50 0 Q75 25 50 50"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead2)"
                      />
                      <defs>
                        <marker
                          id="arrowhead2"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                        </marker>
                      </defs>
                    </svg>
                    {/* Connection points */}
                    <div className="-bottom-1 -translate-x-1/2 absolute left-1/2 h-2 w-2 rounded-full bg-gray-400" />
                  </div>
                  <div className="absolute top-56 right-8">
                    <div className="flex h-10 w-16 items-center justify-center rounded-lg border-2 border-gray-300 bg-amber-100 px-2 py-1 shadow-md">
                      <span className="font-medium text-gray-700 text-xs">
                        Node 2.1
                      </span>
                    </div>
                    {/* Connection line to Node 2 */}
                    <svg
                      className="-top-8 -translate-x-1/2 absolute left-1/2 h-8 w-8 transform"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M50 0 Q25 25 50 50"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead3)"
                      />
                      <defs>
                        <marker
                          id="arrowhead3"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  {/* Node 2.2 */}
                  <div className="absolute top-56 right-24">
                    <div className="flex h-10 w-16 items-center justify-center rounded-lg border-2 border-gray-300 bg-amber-100 px-2 py-1 shadow-md">
                      <span className="font-medium text-gray-700 text-xs">
                        Node 2.2
                      </span>
                    </div>
                    {/* Connection line to Node 2 */}
                    <svg
                      className="-top-8 -translate-x-1/2 absolute left-1/2 h-8 w-8 transform"
                      viewBox="0 0 100 100"
                    >
                      <path
                        d="M50 0 Q75 25 50 50"
                        stroke="#9ca3af"
                        strokeWidth="2"
                        fill="none"
                        markerEnd="url(#arrowhead4)"
                      />
                      <defs>
                        <marker
                          id="arrowhead4"
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 w-full text-center md:w-4/5">
              <p className="font-semibold text-lg">
                {t("features.detail.mindMap.title")}
              </p>
              <p className="mt-4 text-muted-foreground">
                {t("features.detail.mindMap.subTitle")}
              </p>
            </div>
          </div>
        </ScrollAnimation>
      </div>
      <div className="mt-16 grid gap-16 md:mt-32 md:grid-cols-2 md:gap-0">
        <ScrollAnimation direction="left" distance={50}>
          <div className="col-span-1 flex flex-col items-center justify-center space-y-6">
            <div className="relative w-2/3 md:w-1/2">
              <LandingPomodoro />
            </div>
            <div className="w-full md:w-4/5">
              <p className="font-semibold text-lg md:text-xl">
                {t("features.detail.pomodoro.title")}
              </p>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed md:text-base">
                {t("features.detail.pomodoro.subTitle")}
              </p>
            </div>
          </div>
        </ScrollAnimation>
        <ScrollAnimation direction="right" distance={50}>
          <div className="col-span-1 flex flex-col items-center justify-center overflow-hidden">
            <div className="relative mx-auto h-[600px] w-full scale-90 overflow-hidden rounded-md bg-background shadow-lg md:w-4/5">
              {/* Kanban Board */}
              <div className="flex h-full flex-col bg-background p-4">
                <div className="mt-4 flex flex-1 flex-col gap-4 md:flex-row">
                  <div className="flex h-full min-h-96 flex-1 shrink-0 basis-90 flex-col overflow-hidden rounded-md border bg-amber-50 text-card-foreground shadow-sm dark:bg-amber-900/20">
                    <div className="flex flex-col space-y-1.5 border-b p-3">
                      <h3 className="flex items-center justify-between font-semibold text-sm tracking-tight">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-600" />
                          <span>To Do</span>
                        </div>
                        <span className="rounded bg-background/80 px-1.5 py-0.5 text-muted-foreground text-xs">
                          2
                        </span>
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 [overflow-anchor:none]">
                      <div className="space-y-2">
                        <div className="relative cursor-grab touch-manipulation overflow-hidden rounded-md border bg-secondary p-2 text-card-foreground shadow-sm">
                          <div className="flex items-start justify-between gap-1">
                            <p className="min-w-0 flex-1 break-words font-bold text-sm leading-tight">
                              Plan project structure
                            </p>
                            <Button className="inline-flex size-6 shrink-0 select-none items-center justify-center rounded-2xl bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-accent-foreground focus-visible:outline-none">
                              <Pencil />
                            </Button>
                            <Button className="inline-flex size-6 shrink-0 select-none items-center justify-center rounded-2xl bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-accent-foreground focus-visible:outline-none">
                              <Trash2 />
                            </Button>
                          </div>
                          <p className="mt-1 break-words text-muted-foreground text-xs">
                            Outline main components
                          </p>
                        </div>
                        <div className="relative cursor-grab touch-manipulation overflow-hidden rounded-md border bg-secondary p-2 text-card-foreground shadow-sm">
                          <div className="flex items-start justify-between gap-1">
                            <p className="min-w-0 flex-1 break-words font-bold text-sm leading-tight">
                              Set up database schema
                            </p>
                            <Button className="inline-flex size-6 shrink-0 select-none items-center justify-center rounded-2xl bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-accent-foreground focus-visible:outline-none">
                              <Pencil />
                            </Button>
                            <Button className="inline-flex size-6 shrink-0 select-none items-center justify-center rounded-2xl bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-accent-foreground focus-visible:outline-none">
                              <Trash2 />
                            </Button>
                          </div>
                          <p className="mt-1 break-words text-muted-foreground text-xs">
                            Define models and relations
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full min-h-96 flex-1 shrink-0 basis-90 flex-col overflow-hidden rounded-md border bg-blue-50 text-card-foreground shadow-sm dark:bg-blue-900/20">
                    <div className="flex flex-col space-y-1.5 border-b p-3">
                      <h3 className="flex items-center justify-between font-semibold text-sm tracking-tight">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-blue-600" />
                          <span>In Progress</span>
                        </div>
                        <span className="rounded bg-background/80 px-1.5 py-0.5 text-muted-foreground text-xs">
                          1
                        </span>
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 [overflow-anchor:none]">
                      <div className="space-y-2">
                        <div className="relative cursor-grab touch-manipulation overflow-hidden rounded-md border bg-secondary p-2 text-card-foreground shadow-sm">
                          <div className="flex items-start justify-between gap-1">
                            <p className="min-w-0 flex-1 break-words font-bold text-sm leading-tight">
                              Develop authentication
                            </p>
                            <Button
                              className="inline-flex size-6 shrink-0 select-none items-center justify-center rounded-2xl bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-accent-foreground focus-visible:outline-none"
                              aria-label="Edit task"
                            >
                              <Pencil />
                            </Button>
                            <Button
                              className="inline-flex size-6 shrink-0 select-none items-center justify-center rounded-2xl bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-accent-foreground focus-visible:outline-none"
                              aria-label="Delete task"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                          <p className="mt-1 break-words text-muted-foreground text-xs">
                            Implement login/signup flow
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto mt-4 w-full text-balance text-center md:w-4/5">
              <p className="font-semibold text-lg">
                {t("features.detail.kanbanBoard.title")}
              </p>
              <p className="mt-4 text-muted-foreground">
                {t("features.detail.kanbanBoard.subTitle")}
              </p>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </WideContainer>
  );
}
