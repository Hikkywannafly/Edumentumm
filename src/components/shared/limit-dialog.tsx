"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuizLimit } from "@/hooks/quiz/use-quiz-limit";
import { useLocalizedNavigation } from "@/lib/utils/navigation";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useTranslations } from "next-intl";
interface LimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpgrade: () => void;
  onCancel: () => void;
}

export function LimitDialog({
  open,
  onOpenChange,
  onUpgrade,
  onCancel,
}: LimitDialogProps) {
  const t = useTranslations("Quizzes");
  const { data: limitData } = useQuizLimit();
  const { goPricing } = useLocalizedNavigation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden sm:max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <DialogTitle className="flex items-center gap-2">
                {t("create.limitReached")}
              </DialogTitle>
              <DialogDescription>
                {t("create.limitInfo", {
                  created: limitData?.quizzesCreatedThisWeek || 0,
                  limit: limitData?.weeklyLimit || 3,
                })}
              </DialogDescription>
            </motion.div>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="py-4"
          >
            <div className="rounded-r border-amber-500 border-l-4 bg-amber-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-amber-500">💡</span>
                </div>
                <div className="ml-3">
                  <p className="text-amber-700 text-sm">
                    {t("create.upgradeToCreateMore")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={onCancel}
                className="transition-all duration-200 hover:scale-105"
              >
                {t("create.cancel")}
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    onUpgrade();
                    goPricing();
                  }}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-lg transition-all duration-300 hover:from-amber-600 hover:to-orange-700 hover:shadow-xl"
                >
                  <motion.span
                    animate={{
                      x: [0, 5, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                    className="mr-2"
                  >
                    <Crown className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
                  </motion.span>
                  {t("create.upgradeToPro")}
                </Button>
              </motion.div>
            </DialogFooter>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
