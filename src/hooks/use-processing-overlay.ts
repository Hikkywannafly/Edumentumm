import { useCallback, useState } from "react";

interface ProcessingState {
  isVisible: boolean;
  fileName: string;
  label?: string;
  isDone: boolean;
  hasError: boolean;
}

export function useProcessingOverlay() {
  const [state, setState] = useState<ProcessingState>({
    isVisible: false,
    fileName: "",
    label: undefined,
    isDone: false,
    hasError: false,
  });

  const startProcessing = useCallback((fileName: string, label?: string) => {
    setState({
      isVisible: true,
      fileName,
      label,
      isDone: false,
      hasError: false,
    });
  }, []);

  const finishProcessing = useCallback((success = true) => {
    setState((prev) => ({
      ...prev,
      isDone: true,
      hasError: !success,
    }));

    if (!success) {
      setTimeout(() => {
        setState({
          isVisible: false,
          fileName: "",
          label: undefined,
          isDone: false,
          hasError: false,
        });
      }, 3000);
    }
  }, []);

  const hideProcessing = useCallback(() => {
    setState({
      isVisible: false,
      fileName: "",
      label: undefined,
      isDone: false,
      hasError: false,
    });
  }, []);

  const updateProcessingState = useCallback(
    (updates: Partial<ProcessingState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  return {
    ...state,
    startProcessing,
    finishProcessing,
    hideProcessing,
    updateProcessingState,
  };
}
