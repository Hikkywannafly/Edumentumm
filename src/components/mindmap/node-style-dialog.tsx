import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Circle, Diamond, Square } from "lucide-react";
import { useTranslations } from "next-intl";

export type NodeShape = "rectangle" | "circle" | "diamond" | "square";

interface NodeStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentShape: NodeShape;
  onShapeChange: (shape: NodeShape) => void;
  currentBackground?: string;
  currentColor?: string;
  onBackgroundChange?: (color: string) => void;
  onColorChange?: (color: string) => void;
}

const shapeOptions: Array<{
  value: NodeShape;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    value: "rectangle",
    labelKey: "rectangle",
    icon: () => <div className="h-4 w-6 border-2 border-gray-400" />,
  },
  { value: "circle", labelKey: "circle", icon: Circle },
  { value: "diamond", labelKey: "diamond", icon: Diamond },
  { value: "square", labelKey: "square", icon: Square },
];
export function NodeStyleDialog({
  open,
  onOpenChange,
  currentShape,
  onShapeChange,
  currentBackground,
  currentColor,
  onBackgroundChange,
  onColorChange,
}: NodeStyleDialogProps) {
  const t = useTranslations("Mindmap");

  const handleShapeSelect = (shape: NodeShape) => {
    onShapeChange(shape);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("styleDialog.title")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{t("styleDialog.shape")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {shapeOptions.map(({ value, labelKey, icon: Icon }) => (
                <Button
                  key={value}
                  variant={currentShape === value ? "default" : "outline"}
                  className="flex h-16 flex-col items-center justify-center gap-2"
                  onClick={() => handleShapeSelect(value)}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs">
                    {t(`styleDialog.${labelKey}`)}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {(onBackgroundChange || onColorChange) && (
            <div className="space-y-4">
              {onBackgroundChange && (
                <div className="space-y-2">
                  <Label>{t("node.backgroundColor")}</Label>
                  <input
                    type="color"
                    value={currentBackground || "#ffffff"}
                    onChange={(e) => onBackgroundChange(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded border border-border"
                  />
                </div>
              )}

              {onColorChange && (
                <div className="space-y-2">
                  <Label>{t("node.textColor")}</Label>
                  <input
                    type="color"
                    value={currentColor || "#000000"}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="h-10 w-full cursor-pointer rounded border border-border"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
