import { AuthGuard } from "@/components/auth/auth-guard";
import { LocaleProvider } from "@/components/locale-provider";
import { PomodoroAppWrapper } from "@/components/pomodoro/pomodoro-app-wrapper";
import { ReactQueryProvider } from "@/components/provider/react-query-provider";
import { ThemeProvider } from "@/components/theme";
import { AuthProvider } from "@/contexts/auth-context";
import { PomodoroProvider } from "@/contexts/pomodoro-context";
import { QuizNavigationProvider } from "@/contexts/quiz-navigation-context";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";

import { OpenGraph } from "@/lib/og";
import "./globals.css";
import { QuizNavigationGuard } from "@/components/quizzes/take/quiz-navigation-guard";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AttendanceProvider } from "../contexts/attendance-context";
import { PingProvider } from "../contexts/study-time-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...OpenGraph,
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-background font-sans text-foreground antialiased`}
      >
        <NextTopLoader />
        <ReactQueryProvider>
          <ThemeProvider>
            <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ""}>
              <LocaleProvider>
                <AuthProvider>
                  <PomodoroProvider>
                    <QuizNavigationProvider>
                      <AuthGuard>
                        <PingProvider>
                          <AttendanceProvider>
                            <PomodoroAppWrapper>
                              <main className="mx-auto ">{children}</main>
                            </PomodoroAppWrapper>
                          </AttendanceProvider>
                        </PingProvider>
                      </AuthGuard>
                      <QuizNavigationGuard />
                    </QuizNavigationProvider>
                  </PomodoroProvider>
                </AuthProvider>
              </LocaleProvider>
            </GoogleOAuthProvider>
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={4000}
        />
      </body>
    </html>
  );
}
// export const dynamic = "force-dynamic"; // Ensures the layout is always re-rendered
