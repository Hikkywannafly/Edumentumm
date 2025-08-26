import { useCallback, useState } from "react";

type DialogState = {
  chat: boolean;
  gifts: boolean;
  settings: boolean;
};

export function useDialogState() {
  const [dialogState, setDialogState] = useState<DialogState>({
    chat: false,
    gifts: false,
    settings: false,
  });

  const toggleDialog = useCallback((dialog: keyof DialogState) => {
    setDialogState((prev) => ({ ...prev, [dialog]: !prev[dialog] }));
  }, []);

  return {
    dialogState,
    toggleDialog,
  };
}
