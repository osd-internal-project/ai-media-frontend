"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Dropdown, Tag, Typography, message } from "antd";
import { axiosCore } from "@/app/lib/axios/axios";
import WorkflowServices, {
  type WorkflowBlock,
  type WorkflowBlockType,
} from "@/app/services/workflow.service";
import MasterModelTypeServices from "@/app/services/master-model-type.service";
import GenerateServices from "@/app/services/generate.service";
import type { TMasterModelType } from "@/app/common/master-model-type.type";
import { useWebSocket } from "@/app/hooks/useWebsocket";
import WorkflowBlockNode, {
  type WorkflowNodeData,
} from "./workflow-block-node";
import WorkflowEditForm from "./workflow-edit-form";

const nodeTypes = { workflowBlock: WorkflowBlockNode };

interface WorkflowCanvasProps {
  projectId: string;
  conversationId: string;
  conversationName: string;
  userId: string;
  organizationId?: string;
}

/** บล็อกในแคนวาส + ฟิลด์ฝั่ง client (progress, local placeholder) */
type CanvasBlock = WorkflowBlock & { _local?: boolean; _progress?: number };

/** payload ของ event workflow.block.updated จาก backend */
interface BlockUpdatePayload {
  blockId: string;
  status: WorkflowBlock["status"];
  progress?: number;
  outputUrl?: string | null;
  errorMessage?: string | null;
}

/**
 * แคนวาสสร้าง workflow แบบ node-graph (ใช้ React Flow)
 * - โหลดบล็อกจาก backend, อัปเดตเรียลไทม์ผ่าน websocket
 * - บล็อกที่ยังไม่ generate เป็น placeholder ฝั่ง client จนกด Generate จึงสร้างจริง
 */
const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  projectId,
  conversationId,
  conversationName,
  userId,
  organizationId,
}) => {
  const workflowService = useMemo(() => WorkflowServices(axiosCore), []);
  const modelService = useMemo(() => MasterModelTypeServices(axiosCore), []);
  const generateService = useMemo(() => GenerateServices(axiosCore), []);
  const { socket } = useWebSocket();

  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [models, setModels] = useState<TMasterModelType[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  /** Estimated credit per block id (live while editing; stored on generate). */
  const [creditByBlockId, setCreditByBlockId] = useState<
    Record<string, number>
  >({});

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);

  // ref ให้ handler อ่านค่า blocks ล่าสุดได้โดยไม่ต้อง re-create
  const blocksRef = useRef<CanvasBlock[]>([]);
  blocksRef.current = blocks;
  const positionDebounce = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  /** โมเดลที่กรองตามชนิดบล็อก */
  const modelsByType = useCallback(
    (type: WorkflowBlockType) => models.filter((m) => m.type === type),
    [models],
  );

  // ── โหลดข้อมูลเริ่มต้น ────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [conversation, allModels] = await Promise.all([
          workflowService.getConversation(projectId, conversationId),
          modelService.findAll(),
        ]);
        if (!mounted) return;
        setModels(allModels ?? []);
        const loadedBlocks = (conversation.blocks ?? []) as CanvasBlock[];
        setBlocks(loadedBlocks);

        // Backfill per-block credit estimates from their stored generateConfig
        const entries = await Promise.all(
          loadedBlocks.map(async (block) => {
            if (!block.generateConfig) return [block.id, 0] as const;
            const credit = await generateService.getCreditPreSend(
              block.generateConfig,
            );
            return [block.id, typeof credit === "number" ? credit : 0] as const;
          }),
        );
        if (!mounted) return;
        setCreditByBlockId(Object.fromEntries(entries));
      } catch (error) {
        console.error("Failed to load workflow canvas:", error);
        message.error("โหลดแคนวาสไม่สำเร็จ");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [
    conversationId,
    generateService,
    modelService,
    projectId,
    workflowService,
  ]);

  // ── websocket: เข้าห้อง + ฟัง workflow.block.updated ───────────────────────
  useEffect(() => {
    if (!socket) return;

    const joinRoom = () =>
      socket.emit("join-room", { projectId, type: "workflow" });
    joinRoom();
    // เข้าห้องซ้ำทุกครั้งที่ socket reconnect เพื่อไม่ให้หลุดห้อง (update จะได้ไหลลื่น)
    socket.on("connect", joinRoom);

    const handleUpdate = (payload: BlockUpdatePayload) => {
      // กัน outputUrl ที่ไม่ใช่ string (เช่น array จาก payload เก่า)
      const nextOutputUrl =
        typeof payload.outputUrl === "string" ? payload.outputUrl : undefined;
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === payload.blockId
            ? {
                ...b,
                status: payload.status,
                _progress: payload.progress ?? b._progress,
                outputUrl: nextOutputUrl ?? b.outputUrl,
                errorMessage: payload.errorMessage ?? b.errorMessage,
              }
            : b,
        ),
      );
    };

    socket.on("workflow.block.updated", handleUpdate);
    return () => {
      socket.emit("leave-room", { projectId, type: "workflow" });
      socket.off("workflow.block.updated", handleUpdate);
      socket.off("connect", joinRoom);
    };
  }, [socket, projectId]);

  // ── interactions ───────────────────────────────────────────────────────────

  const handleConfigure = useCallback((blockId: string) => {
    setEditingBlockId(blockId);
  }, []);

  /** ลบบล็อก (persisted → เรียก API, local → ลบเฉพาะ state) */
  const handleDelete = useCallback(
    async (blockId: string) => {
      const block = blocksRef.current.find((b) => b.id === blockId);
      if (!block) return;
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      setCreditByBlockId((prev) => {
        const next = { ...prev };
        delete next[blockId];
        return next;
      });
      if (!block._local) {
        try {
          await workflowService.deleteBlock(blockId);
        } catch (error) {
          console.error("Delete block failed:", error);
          message.error("ลบบล็อกไม่สำเร็จ");
        }
      }
    },
    [workflowService],
  );

  /** สั่งรันบล็อกซ้ำ */
  const handleRetry = useCallback(
    async (blockId: string) => {
      try {
        const updated = await workflowService.retryBlock(blockId);
        setBlocks((prev) =>
          prev.map((b) => (b.id === blockId ? { ...b, ...updated } : b)),
        );
      } catch (error) {
        console.error("Retry failed:", error);
        message.error("สั่งรันซ้ำไม่สำเร็จ");
      }
    },
    [workflowService],
  );

  /** เพิ่มบล็อก placeholder (ฝั่ง client) */
  const addPlaceholder = useCallback(
    (
      type: WorkflowBlockType,
      x: number,
      y: number,
      parentBlockIds: string[],
    ) => {
      const temp: CanvasBlock = {
        id: `local-${crypto.randomUUID()}`,
        workflowConversationId: conversationId,
        parentBlockIds,
        type,
        status: "pending",
        prompt: "",
        model: "",
        resolution: "",
        positionX: x,
        positionY: y,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _local: true,
      };
      setBlocks((prev) => [...prev, temp]);
      // console.log([blocks, temp]);
      setEditingBlockId(temp.id);
    },
    [conversationId],
  );

  /** + Add child: เลือกชนิดบล็อกลูกก่อน แล้วสร้าง placeholder ผูกกับ parent */
  const handleAddChild = useCallback(
    (parentId: string, childType: WorkflowBlockType) => {
      const parent = blocksRef.current.find((b) => b.id === parentId);
      if (!parent) return;
      // กฎ: output วิดีโอใส่ได้เฉพาะบล็อกวิดีโอ (รูปใส่ได้ทั้ง image/video)
      const type = parent.type === "video" ? "video" : childType;
      addPlaceholder(type, parent.positionX + 380, parent.positionY, [
        parentId,
      ]);
    },
    [addPlaceholder],
  );

  /** toggle เลือกบล็อก (เฉพาะ success) สำหรับ Combine */
  const handleToggleSelect = useCallback((blockId: string) => {
    setSelectedIds((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId],
    );
  }, []);

  /** Combine N blocks → placeholder ที่ผูกทุกบล็อกที่เลือกเป็น parent */
  const handleCombine = useCallback(() => {
    if (selectedIds.length === 0) return;
    const parents = blocksRef.current.filter((b) => selectedIds.includes(b.id));
    const avgX =
      parents.reduce((s, b) => s + b.positionX, 0) / parents.length + 380;
    const avgY = parents.reduce((s, b) => s + b.positionY, 0) / parents.length;
    addPlaceholder(parents[0].type, avgX, avgY, [...selectedIds]);
    setSelectedIds([]);
  }, [addPlaceholder, selectedIds]);

  /** กด Generate ในฟอร์ม → สร้างบล็อกจริง + enqueue ผ่าน backend */
  const handleGenerate = useCallback(
    async (
      localBlock: CanvasBlock,
      payload: {
        prompt: string;
        model: string;
        resolution: string;
        generateConfig: Record<string, unknown>;
        estimatedCredit?: number;
      },
    ) => {
      setSubmitting(true);
      try {
        const created = await workflowService.createBlock(conversationId, {
          type: localBlock.type,
          prompt: payload.prompt,
          model: payload.model,
          resolution: payload.resolution,
          parentBlockIds: localBlock.parentBlockIds,
          positionX: localBlock.positionX,
          positionY: localBlock.positionY,
          generateConfig: payload.generateConfig,
        });
        // แทนที่ placeholder ด้วยบล็อกจริง
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === localBlock.id ? ({ ...created } as CanvasBlock) : b,
          ),
        );
        // Re-key the credit estimate from the local placeholder to the real block
        setCreditByBlockId((prev) => {
          const { [localBlock.id]: prevEstimate, ...rest } = prev;
          return {
            ...rest,
            [created.id]: payload.estimatedCredit ?? prevEstimate ?? 0,
          };
        });
        setEditingBlockId(null);
      } catch (error) {
        console.error("Generate failed:", error);
        message.error("สร้างงาน generate ไม่สำเร็จ");
      } finally {
        setSubmitting(false);
      }
    },
    [conversationId, workflowService],
  );

  /** New block: เลือกชนิดแล้ววาง placeholder กลางแคนวาส */
  const handleNewBlock = useCallback(
    (type: WorkflowBlockType) => {
      const offset = blocksRef.current.length * 40;
      addPlaceholder(type, 200 + offset, 160 + offset, []);
    },
    [addPlaceholder],
  );

 
  /** Run all: สั่งรันซ้ำบล็อกที่ failed ทั้งหมดแบบลำดับ */
  const handleRunAll = useCallback(async () => {
    const failed = blocksRef.current.filter((b) => b.status === "failed");
    for (const b of failed) {
      await handleRetry(b.id);
    }
    if (failed.length === 0) message.info("ไม่มีบล็อกที่ต้องรันซ้ำ");
  }, [handleRetry]);

  /** เชื่อมเส้นจาก connector (เฉพาะ target ที่เป็น placeholder จึงผูก parent ได้) */
  const onConnect = useCallback((connection: Connection) => {
    const target = blocksRef.current.find((b) => b.id === connection.target);
    if (!connection.source || !target) return;
    if (!target._local) {
      message.info("เชื่อมบล็อกที่สร้างแล้วเข้าด้วยกันยังไม่รองรับ");
      return;
    }
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === target.id && !b.parentBlockIds.includes(connection.source!)
          ? { ...b, parentBlockIds: [...b.parentBlockIds, connection.source!] }
          : b,
      ),
    );
  }, []);

  /** ลากการ์ดจบ → persist ตำแหน่ง (เฉพาะบล็อกที่สร้างแล้ว) แบบ debounce 500ms */
  const onNodeDragStop: OnNodeDrag<Node> = useCallback(
    (_event, node) => {
      const block = blocksRef.current.find((b) => b.id === node.id);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === node.id
            ? { ...b, positionX: node.position.x, positionY: node.position.y }
            : b,
        ),
      );
      if (!block || block._local) return;
      clearTimeout(positionDebounce.current[node.id]);
      positionDebounce.current[node.id] = setTimeout(() => {
        workflowService
          .updateBlockPosition(node.id, node.position.x, node.position.y)
          .catch((err) => console.error("Persist position failed:", err));
      }, 500);
    },
    [workflowService],
  );

  // ── สร้าง nodes/edges จาก blocks ────────────────────────────────────────────
  const renderEditForm = useCallback(
    (block: WorkflowBlock) => (
      <WorkflowEditForm
        type={block.type}
        projectId={projectId}
        userId={userId}
        organizationId={organizationId}
        models={modelsByType(block.type)}
        submitting={submitting}
        onSubmit={(payload) => handleGenerate(block as CanvasBlock, payload)}
        onEstimate={(credit) =>
          setCreditByBlockId((prev) => ({ ...prev, [block.id]: credit }))
        }
        onCancel={() => setEditingBlockId(null)}
      />
    ),
    [
      handleGenerate,
      modelsByType,
      organizationId,
      projectId,
      submitting,
      userId,
    ],
  );

  useEffect(() => {
    // map id → outputUrl เพื่อทำ thumbnail ของ parent
    const outputById = new Map(blocks.map((b) => [b.id, b.outputUrl ?? ""]));

    setNodes((prevNodes) => {
      const prevPos = new Map(prevNodes.map((n) => [n.id, n.position]));
      return blocks.map<Node>((block) => {
        const data: WorkflowNodeData = {
          block,
          progress: block._progress ?? (block.status === "success" ? 1 : 0),
          selected: selectedIds.includes(block.id),
          editing: editingBlockId === block.id,
          parentThumbs: block.parentBlockIds.map(
            (pid) => outputById.get(pid) ?? "",
          ),
          onConfigure: handleConfigure,
          onDelete: handleDelete,
          onRetry: handleRetry,
          onAddChild: handleAddChild,
          onToggleSelect: handleToggleSelect,
          renderEditForm,
        };
        return {
          id: block.id,
          type: "workflowBlock",
          position: prevPos.get(block.id) ?? {
            x: block.positionX,
            y: block.positionY,
          },
          data: data as unknown as Record<string, unknown>,
          dragHandle: ".drag-handle",
        };
      });
    });

    setEdges(
      blocks.flatMap<Edge>((child) =>
        child.parentBlockIds.map((parentId) => {
          const parent = blocks.find((b) => b.id === parentId);
          const parentSuccess = parent?.status === "success";
          const childProcessing = child.status === "processing";
          const stroke = parentSuccess
            ? childProcessing
              ? "#f59e0b"
              : "#22c55e"
            : "#52525b";
          return {
            id: `${parentId}->${child.id}`,
            source: parentId,
            target: child.id,
            animated: parentSuccess && childProcessing,
            style: {
              stroke,
              strokeWidth: 2,
              strokeDasharray:
                parentSuccess && !childProcessing ? undefined : "6 4",
            },
            markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
          };
        }),
      ),
    );
  }, [
    blocks,
    editingBlockId,
    selectedIds,
    handleConfigure,
    handleDelete,
    handleRetry,
    handleAddChild,
    handleToggleSelect,
    renderEditForm,
    setNodes,
    setEdges,
  ]);

  // สรุปจำนวนตามสถานะ
  const counts = useMemo(() => {
    const c = { pending: 0, processing: 0, success: 0, failed: 0 };
    blocks.forEach((b) => (c[b.status] += 1));
    return c;
  }, [blocks]);

  // สรุปเครดิตรวมของทั้ง workflow (เฉพาะบล็อกที่ยังอยู่)
  const totalEstimate = useMemo(
    () => blocks.reduce((sum, b) => sum + (creditByBlockId[b.id] ?? 0), 0),
    [blocks, creditByBlockId],
  );

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header bar */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b"
        style={{ borderColor: "rgba(0,0,0,0.08)" }}
      >
        <Typography.Text strong>{conversationName}</Typography.Text>
        <div className="flex items-center gap-2 ml-2">
          <Tag>Pending {counts.pending}</Tag>
          <Tag color="gold">Processing {counts.processing}</Tag>
          <Tag color="green">Success {counts.success}</Tag>
          <Tag color="red">Failed {counts.failed}</Tag>
          <Tag color="purple">Est. credit {totalEstimate}</Tag>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button type="dashed" onClick={handleCombine}>
              Combine {selectedIds.length} blocks
            </Button>
          )}
          <Button onClick={handleRunAll}>Run all</Button>
          <Dropdown
            menu={{
              items: [
                { key: "image", label: "Image block" },
                { key: "video", label: "Video block" },
              ],
              onClick: ({ key }) => handleNewBlock(key as WorkflowBlockType),
            }}
          >
            <Button type="primary">New block</Button>
          </Dropdown>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
