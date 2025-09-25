import { useCallback, useState } from "react";

export function usePlan() {
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);

  const togglePlanExpansion = useCallback((planId: number) => {
    setExpandedPlan((prev) => (prev === planId ? null : planId));
  }, []);

  return {
    expandedPlan,
    togglePlanExpansion,
  };
}
