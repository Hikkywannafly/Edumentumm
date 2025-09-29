import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NodeData } from "@/stores/mindmap";
import { Plus, X } from "lucide-react";
import { memo, useState } from "react";
import { Handle, type NodeProps, Position } from "reactflow";

const MindMapNode = ({ data }: NodeProps<NodeData>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    data.onChange?.(newLabel);
  };

  const handleAddChild = () => {
    data.onAddChild?.();
  };

  const handleDelete = () => {
    data.onDelete?.();
  };

  const nodeStyle = {
    background: data.background || "hsl(var(--card))",
    color: data.color || "hsl(var(--card-foreground))",
    border: "1px solid hsl(var(--border))",
  };

  // Determine shape classes based on data.shape
  const getShapeClasses = () => {
    const baseClasses = "relative shadow-lg transition-all hover:shadow-xl";
    switch (data.shape) {
      case "circle":
        return `${baseClasses} rounded-full w-32 h-32 flex items-center justify-center`;
      case "diamond":
        return `${baseClasses} w-24 h-24 transform rotate-45 flex items-center justify-center`;
      case "square":
        return `${baseClasses} rounded-none w-28 h-28 flex items-center justify-center`;
      default:
        return `${baseClasses} rounded-lg`;
    }
  };

  const isCompactShape =
    data.shape && ["circle", "diamond", "square"].includes(data.shape);

  return (
    <div className={getShapeClasses()} style={nodeStyle}>
      {/* Top handle - both input and output */}
      <Handle
        type="target"
        position={Position.Top}
        className="h-2 w-2 border-blue-600 bg-blue-500"
        id="top-target"
        style={
          data.shape === "diamond" ? { top: "0%", left: "50%" } : undefined
        }
      />
      <Handle
        type="source"
        position={Position.Top}
        className="h-2 w-2 border-blue-600 bg-blue-500"
        id="top-source"
        style={
          data.shape === "diamond" ? { top: "0%", left: "50%" } : undefined
        }
      />

      {/* Left handle - both input and output */}
      <Handle
        type="target"
        position={Position.Left}
        className="h-2 w-2 border-green-600 bg-green-500"
        id="left-target"
        style={
          data.shape === "diamond" ? { left: "0%", top: "50%" } : undefined
        }
      />
      <Handle
        type="source"
        position={Position.Left}
        className="h-2 w-2 border-green-600 bg-green-500"
        id="left-source"
        style={
          data.shape === "diamond" ? { left: "0%", top: "50%" } : undefined
        }
      />

      {/* Right handle - both input and output */}
      <Handle
        type="target"
        position={Position.Right}
        className="h-2 w-2 border-orange-600 bg-orange-500"
        id="right-target"
        style={
          data.shape === "diamond" ? { right: "0%", top: "50%" } : undefined
        }
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-2 w-2 border-orange-600 bg-orange-500"
        id="right-source"
        style={
          data.shape === "diamond" ? { right: "0%", top: "50%" } : undefined
        }
      />

      <div
        className={
          isCompactShape
            ? "flex items-center justify-center p-2"
            : "min-w-[120px] max-w-[200px] p-4"
        }
      >
        {isEditing ? (
          <div className={isCompactShape ? "w-full" : "space-y-2"}>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  handleLabelChange(label);
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setLabel(data.label || "");
                }
              }}
              className={isCompactShape ? "h-6 w-full text-xs" : "h-8 text-sm"}
              autoFocus
            />
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAddChild}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={
              isCompactShape
                ? "flex items-center justify-center text-center"
                : "space-y-2"
            }
          >
            <div
              className={`cursor-pointer break-words font-medium ${
                isCompactShape
                  ? "max-w-full overflow-hidden text-ellipsis text-xs leading-tight"
                  : "text-sm"
              }`}
              onDoubleClick={() => setIsEditing(true)}
            >
              {isCompactShape && label && label.length > 12
                ? `${label.slice(0, 12)}...`
                : label || "Double click to edit"}
            </div>
          </div>
        )}
      </div>

      {/* Bottom handle - both input and output */}
      <Handle
        type="target"
        position={Position.Bottom}
        className="h-2 w-2 border-purple-600 bg-purple-500"
        id="bottom-target"
        style={
          data.shape === "diamond" ? { bottom: "0%", left: "50%" } : undefined
        }
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-2 w-2 border-purple-600 bg-purple-500"
        id="bottom-source"
        style={
          data.shape === "diamond" ? { bottom: "0%", left: "50%" } : undefined
        }
      />
    </div>
  );
};

export default memo(MindMapNode);
