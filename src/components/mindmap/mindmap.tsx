import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  ConnectionLineType,
  Controls,
  MarkerType,
  MiniMap,
  type Node,
  type NodeOrigin,
  ReactFlowProvider,
  useReactFlow,
  useStoreApi,
} from "reactflow";
// @ts-ignore
import "reactflow/dist/style.css";
import { useMindmapStore } from "@/stores/mindmap";
import { nanoid } from "nanoid";
import { useTranslations } from "next-intl";
import { NodeContextMenu, PaneContextMenu } from "./context-menu";
import MindMapEdge from "./edge";
import MindMapNode from "./node";
import { type NodeShape, NodeStyleDialog } from "./node-style-dialog";

const nodeTypes = {
  mindmap: MindMapNode,
};

const edgeTypes = {
  mindmap: MindMapEdge,
};

// this places the node origin in the center of a node
const nodeOrigin: NodeOrigin = [0.5, 0.5];
const connectionLineStyle = {
  strokeWidth: 1,
};
const defaultEdgeOptions = { style: connectionLineStyle, type: "mindmap" };

interface MindmapProps {
  isFullScreen?: boolean;
}

const Mindmap = ({ isFullScreen = false }: MindmapProps) => {
  const [menu, setMenu] = useState<any>(null);
  const [styleDialog, setStyleDialog] = useState<{ node: Node | null }>({
    node: null,
  });
  const ref = useRef<any>(null);
  const mindmapNodes = useMindmapStore((state) => state.mindmapNodes);
  const mindmapEdges = useMindmapStore((state) => state.mindmapEdges);
  const onMindmapNodesChange = useMindmapStore(
    (state) => state.onMindmapNodesChange,
  );
  const onMindmapEdgesChange = useMindmapStore(
    (state) => state.onMindmapEdgesChange,
  );
  const addMindmapChildNode = useMindmapStore(
    (state) => state.addMindmapChildNode,
  );
  const updateMindmapNodeData = useMindmapStore(
    (state) => state.updateMindmapNodeData,
  );
  const deleteMindmapNode = useMindmapStore((state) => state.deleteMindmapNode);
  const addMindmapNode = useMindmapStore((state) => state.addMindmapNode);
  const setMindmapData = useMindmapStore((state) => state.setMindmapData);

  const connectingNodeId = useRef<string | null>(null);
  const connectingHandle = useRef<string | null>(null);
  const [rfInstance, setRfInstance] = useState<any>(null);
  const t = useTranslations("Mindmap");

  const store = useStoreApi();
  const { screenToFlowPosition } = useReactFlow();

  const getChildNodePosition = useCallback(
    (event: MouseEvent, parentNode?: Node) => {
      const { domNode } = store.getState();

      if (
        !domNode ||
        !parentNode?.positionAbsolute ||
        !parentNode?.width ||
        !parentNode?.height
      ) {
        return;
      }

      const panePosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      return {
        x:
          panePosition.x - parentNode.positionAbsolute.x + parentNode.width / 2,
        y:
          panePosition.y -
          parentNode.positionAbsolute.y +
          parentNode.height / 2,
      };
    },
    [screenToFlowPosition, store],
  );

  const onConnectStart = useCallback((_: any, { nodeId, handleId }: any) => {
    connectingNodeId.current = nodeId;
    connectingHandle.current = handleId;
  }, []);

  // Thêm callback onConnect
  const onConnect = useCallback(
    (params: any) => {
      // params: { source, sourceHandle, target, targetHandle }
      if (
        params.source &&
        params.target &&
        params.source !== params.target &&
        !mindmapEdges.some(
          (e) =>
            e.source === params.source &&
            e.target === params.target &&
            e.sourceHandle === params.sourceHandle &&
            e.targetHandle === params.targetHandle,
        )
      ) {
        setMindmapData(mindmapNodes, [
          ...mindmapEdges,
          {
            id: nanoid(),
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
            type: "mindmap",
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          },
        ]);
      }
    },
    [mindmapNodes, mindmapEdges, setMindmapData],
  );

  // Sửa lại onConnectEnd chỉ dùng cho việc tạo node con khi kéo ra ngoài pane
  const onConnectEnd = useCallback(
    (event: any) => {
      const { nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        "react-flow__pane",
      );
      if (targetIsPane && connectingNodeId.current) {
        const parentNode = nodeInternals.get(connectingNodeId.current);
        const childNodePosition = getChildNodePosition(event, parentNode);
        if (parentNode && childNodePosition) {
          // Determine direction based on the handle that was dragged
          let direction = "right"; // default
          if (connectingHandle.current) {
            if (connectingHandle.current.includes("left")) {
              direction = "left";
            } else if (connectingHandle.current.includes("right")) {
              direction = "right";
            } else if (connectingHandle.current.includes("top")) {
              direction = "up";
            } else if (connectingHandle.current.includes("bottom")) {
              direction = "down";
            }
          }
          addMindmapChildNode(parentNode, childNodePosition, direction);
        }
      }
    },
    [getChildNodePosition, addMindmapChildNode, store],
  );

  const onNodeContextMenu = useCallback((event: any, node: Node) => {
    event.preventDefault();
    const paneRect = ref.current.getBoundingClientRect();
    const OFFSET = 12; // show slightly to the right of cursor
    const MENU_WIDTH = 200;
    const MENU_HEIGHT = 200;

    let left = event.clientX - paneRect.left + OFFSET;
    let top = event.clientY - paneRect.top;

    // Clamp within pane bounds
    if (left + MENU_WIDTH > paneRect.width) {
      left = Math.max(0, paneRect.width - MENU_WIDTH - 8);
    }
    if (top + MENU_HEIGHT > paneRect.height) {
      top = Math.max(0, paneRect.height - MENU_HEIGHT - 8);
    }

    setMenu({
      id: node.id,
      top,
      left,
      data: node.data,
      node,
    });
  }, []);

  const onPaneClick = useCallback(() => setMenu(null), []);

  const handleContextMenuAction = (action: string, direction?: string) => {
    if (menu?.id === "pane") {
      if (action === "add") {
        const position = rfInstance.screenToFlowPosition({
          x: menu.left,
          y: menu.top,
        });
        addMindmapNode(
          {
            id: `node-${Date.now()}`,
            type: "mindmap",
            position,
            data: { label: t("node.newNode") },
          },
          position,
        );
      }
    } else if (menu?.id) {
      const node = mindmapNodes.find((n) => n.id === menu.id);
      if (node) {
        if (action === "add") {
          let position: { x: number; y: number };
          switch (direction) {
            case "left":
              position = {
                x: node.position.x - 200,
                y: node.position.y,
              };
              break;
            case "right":
              position = {
                x: node.position.x + 200,
                y: node.position.y,
              };
              break;
            case "up":
              position = {
                x: node.position.x,
                y: node.position.y - 120,
              };
              break;
            case "down":
              position = {
                x: node.position.x,
                y: node.position.y + 120,
              };
              break;
            default:
              // Default behavior (right)
              position = {
                x: node.position.x + 200,
                y: node.position.y,
              };
          }
          addMindmapChildNode(node, position, direction);
        } else if (action === "delete") {
          deleteMindmapNode(node.id);
        }
      }
    }
    setMenu(null);
  };

  const getNodeData = (node: Node) => ({
    ...node.data,
    onChange: (
      label: string,
      style?: { background?: string; color?: string },
    ) => {
      updateMindmapNodeData(node.id, {
        label,
        ...(style || {}),
      });
    },
    onAddChild: () => {
      const position = {
        x: node.position.x + 200,
        y: node.position.y,
      };
      addMindmapChildNode(node, position, "right");
    },
    onAddChildLeft: () => {
      const position = {
        x: node.position.x - 200,
        y: node.position.y,
      };
      addMindmapChildNode(node, position, "left");
    },
    onAddChildRight: () => {
      const position = {
        x: node.position.x + 200,
        y: node.position.y,
      };
      addMindmapChildNode(node, position, "right");
    },
    onAddChildUp: () => {
      const position = {
        x: node.position.x,
        y: node.position.y - 120,
      };
      addMindmapChildNode(node, position, "up");
    },
    onAddChildDown: () => {
      const position = {
        x: node.position.x,
        y: node.position.y + 120,
      };
      addMindmapChildNode(node, position, "down");
    },
    onDelete: () => deleteMindmapNode(node.id),
  });

  return (
    <div
      className={`h-full w-full ${isFullScreen ? "fixed inset-0 z-50" : ""}`}
      style={{ height: "100%", width: "100%" }}
    >
      <div
        ref={ref}
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <ReactFlow
          nodes={mindmapNodes.map((node) => ({
            ...node,
            data: getNodeData(node),
          }))}
          edges={mindmapEdges}
          onNodesChange={onMindmapNodesChange}
          onEdgesChange={onMindmapEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onNodeClick={() => {
            // Handle node click if needed
          }}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneContextMenu={(event) => {
            event.preventDefault();
            const paneRect = ref.current.getBoundingClientRect();
            const OFFSET = 12;
            setMenu({
              id: "pane",
              top: event.clientY - paneRect.top,
              left: event.clientX - paneRect.left + OFFSET,
            });
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodeOrigin={nodeOrigin}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineType={ConnectionLineType.SmoothStep}
          onInit={setRfInstance}
          fitView
        >
          <Background className="bg-background" />
          <Controls className="rounded-lg border border-border bg-background shadow-lg" />
          <MiniMap className="rounded-lg border border-border bg-background shadow-lg" />

          {/* Save button is now in the header */}

          {menu && menu.id !== "pane" && (
            <NodeContextMenu
              top={menu.top}
              left={menu.left}
              onAddChild={() => handleContextMenuAction("add")}
              onDelete={() => handleContextMenuAction("delete")}
              onEditStyle={() => setStyleDialog({ node: menu.node })}
              onClose={() => setMenu(null)}
            />
          )}
          {menu && menu.id === "pane" && (
            <PaneContextMenu
              top={menu.top}
              left={menu.left}
              onAddNode={() => handleContextMenuAction("add")}
              onClose={() => setMenu(null)}
            />
          )}
          <NodeStyleDialog
            open={!!styleDialog.node}
            onOpenChange={(open) => !open && setStyleDialog({ node: null })}
            currentShape={styleDialog.node?.data?.shape || "rectangle"}
            currentBackground={styleDialog.node?.data?.background}
            currentColor={styleDialog.node?.data?.color}
            onShapeChange={(shape: NodeShape) => {
              if (styleDialog.node) {
                updateMindmapNodeData(styleDialog.node.id, { shape });
              }
            }}
            onBackgroundChange={(background: string) => {
              if (styleDialog.node) {
                updateMindmapNodeData(styleDialog.node.id, { background });
              }
            }}
            onColorChange={(color: string) => {
              if (styleDialog.node) {
                updateMindmapNodeData(styleDialog.node.id, { color });
              }
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

export default ({ isFullScreen = false }: MindmapProps) => {
  return (
    <ReactFlowProvider>
      <Mindmap isFullScreen={isFullScreen} />
    </ReactFlowProvider>
  );
};
