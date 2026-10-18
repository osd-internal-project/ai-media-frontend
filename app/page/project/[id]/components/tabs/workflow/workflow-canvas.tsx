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
import "./workflow.css";
import { Button, Dropdown, message } from "antd";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import {
  ArrowLeft,
  Coins,
  Image as ImageIcon,
  Layers,
  Plus,
  Sparkles,
  Video as VideoIcon,
} from "lucide-react";
import { useThemeMode } from "@/app/components/ThemeProvider";
import { getThemeConfig } from "@/app/theme/themeConfig";
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
  type ParentRef,
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
  const router = useRouter();
  const { mode } = useThemeMode();
  const { socket } = useWebSocket();

  const workflowService = useMemo(() => WorkflowServices(axiosCore), []);
  const modelService = useMemo(() => MasterModelTypeServices(axiosCore), []);
  const generateService = useMemo(() => GenerateServices(axiosCore), []);

  /**
   * Workflow palette derived from the AI CAVE design tokens, exposed as CSS
   * variables on the canvas wrapper so block nodes inherit the theme without
   * threading context through every React Flow node.
   */
  const palette = useMemo(() => {
    const t = getThemeConfig(mode).token ?? {};
    const isDark = mode === "dark";
    return {
      cardBg: isDark ? "#21262B" : "#FFFFFF",
      headerBg: t.colorBgContainer ?? (isDark ? "#21262B" : "#FFFFFF"),
      border: t.colorBorder ?? (isDark ? "#3A434F" : "#D3DAE3"),
      hairline: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      primary: t.colorPrimary ?? "#6F6ADE",
      text: t.colorTextBase ?? (isDark ? "#F2F4F5" : "#191C20"),
      textDim: t.colorTextSecondary ?? "#8C99A9",
      success: "#22C55E",
      warning: "#FF8F00",
      error: "#FF3C38",
      canvasBg: isDark ? "#191C20" : "#F2F4F5",
      dot: isDark ? "#3A434F" : "#D3DAE3",
      // พื้นหลัง media/ช่องกรอก — เข้มกว่าการ์ดเล็กน้อยให้ภาพเด่น
      surface: isDark ? "#191C20" : "#F2F4F5",
    };
  }, [mode]);

  /** CSS custom properties consumed by block-node inline styles. */
  const paletteVars = useMemo(
    () =>
      ({
        "--wf-card-bg": palette.cardBg,
        "--wf-border": palette.border,
        "--wf-hairline": palette.hairline,
        "--wf-primary": palette.primary,
        "--wf-text": palette.text,
        "--wf-text-dim": palette.textDim,
        "--wf-success": palette.success,
        "--wf-warning": palette.warning,
        "--wf-error": palette.error,
        "--wf-surface": palette.surface,
        "--wf-canvas-bg": palette.canvasBg,
      }) as React.CSSProperties,
    [palette],
  );

  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  /** โหลดครั้งแรกเสร็จแล้ว (กัน empty state กะพริบระหว่างโหลด) */
  const [loaded, setLoaded] = useState(false);
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
      } finally {
        if (mounted) setLoaded(true);
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

  /**
   * โหลดบล็อกจาก server ใหม่ (ตามทัน event ที่พลาดตอน socket หลุด/แท็บหลับ)
   * คง placeholder ฝั่ง client และ progress ที่รู้อยู่แล้วไว้
   */
  const resyncBlocks = useCallback(async () => {
    try {
      const conversation = await workflowService.getConversation(
        projectId,
        conversationId,
      );
      const serverBlocks = (conversation.blocks ?? []) as CanvasBlock[];
      setBlocks((prev) => {
        const prevById = new Map(prev.map((b) => [b.id, b]));
        const merged = serverBlocks.map((b) => {
          const known = prevById.get(b.id);
          return b.status === "processing" && known?._progress !== undefined
            ? { ...b, _progress: known._progress }
            : b;
        });
        return [...merged, ...prev.filter((b) => b._local)];
      });
    } catch (error) {
      console.error("Resync workflow blocks failed:", error);
    }
  }, [conversationId, projectId, workflowService]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") resyncBlocks();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [resyncBlocks]);

  // ── websocket: เข้าห้อง + ฟัง workflow.block.updated ───────────────────────
  useEffect(() => {
    if (!socket) return;

    const joinRoom = () =>
      socket.emit("join-room", { projectId, type: "workflow" });
    joinRoom();
    // reconnect: เข้าห้องซ้ำ + resync เพราะ event ระหว่างหลุดจะไม่ถูกส่งซ้ำ
    const onReconnect = () => {
      joinRoom();
      resyncBlocks();
    };
    socket.on("connect", onReconnect);

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
      socket.off("connect", onReconnect);
    };
  }, [socket, projectId, resyncBlocks]);

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

  /**
   * + Add child: สร้าง placeholder ชนิดที่เลือกจากเมนู ผูกกับ parent แล้วเปิดฟอร์ม
   * parent วิดีโอ → บังคับเป็น video (output วิดีโอใส่ได้เฉพาะบล็อกวิดีโอ)
   */
  const handleAddChild = useCallback(
    (parentId: string, requested: WorkflowBlockType) => {
      const parent = blocksRef.current.find((b) => b.id === parentId);
      if (!parent) return;
      const type: WorkflowBlockType =
        parent.type === "video" ? "video" : requested;
      addPlaceholder(type, parent.positionX + 420, parent.positionY, [
        parentId,
      ]);
    },
    [addPlaceholder],
  );

  /** toggle เลือกบล็อก (เฉพาะ success + เป็นรูปภาพ) สำหรับ Combine */
  const handleToggleSelect = useCallback((blockId: string) => {
    const block = blocksRef.current.find((b) => b.id === blockId);
    // Combine รองรับเฉพาะบล็อกรูปภาพที่ generate สำเร็จแล้วเท่านั้น
    if (!block || block.status !== "success" || block.type !== "image") return;
    setSelectedIds((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId],
    );
  }, []);

  /** Combine N blocks → placeholder ที่ผูกทุกบล็อกที่เลือก (รูปภาพ) เป็น parent */
  const handleCombine = useCallback(() => {
    if (selectedIds.length === 0) return;
    // กรองให้เหลือเฉพาะบล็อกรูปภาพ (กันกรณี selection หลุด rule)
    const parents = blocksRef.current.filter(
      (b) => selectedIds.includes(b.id) && b.type === "image",
    );
    if (parents.length === 0) {
      message.info("Combine รองรับเฉพาะบล็อกรูปภาพ");
      return;
    }
    const avgX =
      parents.reduce((s, b) => s + b.positionX, 0) / parents.length + 380;
    const avgY = parents.reduce((s, b) => s + b.positionY, 0) / parents.length;
    // parents เป็นรูปภาพทั้งหมด → บล็อกใหม่เริ่มเป็น image และสลับเป็น video ได้
    addPlaceholder("image", avgX, avgY, parents.map((b) => b.id));
    setSelectedIds([]);
  }, [addPlaceholder, selectedIds]);

  /**
   * สลับชนิดบล็อก (image⇄video) ก่อน generate เท่านั้น (เฉพาะ placeholder/local)
   * รีเซ็ต model เพราะรายการโมเดลผูกกับชนิด
   */
  const handleChangeBlockType = useCallback(
    (blockId: string, type: WorkflowBlockType) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId && b._local ? { ...b, type, model: "" } : b,
        ),
      );
    },
    [],
  );

  /**
   * บล็อกสลับชนิดได้เมื่อไม่มี parent หรือ parent ทุกตัวเป็นรูปภาพ
   * (output วิดีโอใส่ได้เฉพาะบล็อกวิดีโอ → ถ้า ref ไม่ใช่รูปจะล็อกเป็น video)
   */
  const canSwitchType = useCallback(
    (block: CanvasBlock) =>
      block.parentBlockIds.length === 0 ||
      block.parentBlockIds.every(
        (pid) =>
          blocksRef.current.find((b) => b.id === pid)?.type === "image",
      ),
    [],
  );

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
        // backend ตอบ 400 พร้อมเหตุผล (เช่น model ไม่รับ input ชนิดนี้) — แสดงให้ผู้ใช้เห็น
        const reason = isAxiosError<{ message?: string | string[] }>(error)
          ? error.response?.data?.message
          : undefined;
        message.error(
          reason
            ? `สร้างงาน generate ไม่สำเร็จ: ${[reason].flat().join(", ")}`
            : "สร้างงาน generate ไม่สำเร็จ",
        );
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

  /** output + ชนิดของ parent แต่ละตัว (ใช้ทั้ง thumbnail บนการ์ดและฟอร์ม) */
  const parentRefsOf = useCallback(
    (block: WorkflowBlock): ParentRef[] =>
      block.parentBlockIds.map((pid) => {
        const parent = blocksRef.current.find((b) => b.id === pid);
        return { url: parent?.outputUrl ?? "", type: parent?.type ?? "image" };
      }),
    [],
  );

  /**
   * ลากเส้นได้เฉพาะจากบล็อกที่ success ไปยัง placeholder ที่ยังไม่ generate
   * และบล็อกรูปรับได้เฉพาะ parent ที่เป็นรูป (model ของบล็อกวิดีโอตรวจต่อในฟอร์ม)
   */
  const isValidConnection = useCallback((conn: Edge | Connection) => {
    if (!conn.source || !conn.target || conn.source === conn.target) return false;
    const source = blocksRef.current.find((b) => b.id === conn.source);
    const target = blocksRef.current.find((b) => b.id === conn.target);
    if (!source || !target || !target._local) return false;
    if (source.status !== "success") return false;
    if (target.parentBlockIds.includes(source.id)) return false;
    return target.type === "video" || source.type === "image";
  }, []);

  // ── สร้าง nodes/edges จาก blocks ────────────────────────────────────────────
  const renderEditForm = useCallback(
    (block: WorkflowBlock) => (
      <WorkflowEditForm
        // remount on type change so model/resolution/uploads reset cleanly
        key={block.type}
        type={block.type}
        canSwitchType={canSwitchType(block as CanvasBlock)}
        onChangeType={(t) => handleChangeBlockType(block.id, t)}
        projectId={projectId}
        userId={userId}
        organizationId={organizationId}
        models={modelsByType(block.type)}
        parents={parentRefsOf(block)}
        submitting={submitting}
        onSubmit={(payload) => handleGenerate(block as CanvasBlock, payload)}
        onEstimate={(credit) =>
          setCreditByBlockId((prev) => ({ ...prev, [block.id]: credit }))
        }
        onCancel={() => setEditingBlockId(null)}
      />
    ),
    [
      canSwitchType,
      handleChangeBlockType,
      handleGenerate,
      modelsByType,
      parentRefsOf,
      organizationId,
      projectId,
      submitting,
      userId,
    ],
  );

  useEffect(() => {
    // map id → บล็อก เพื่อดึง output + ชนิด (รูป/วิดีโอ) ของ parent มาทำ thumbnail
    const blockById = new Map(blocks.map((b) => [b.id, b]));

    setNodes((prevNodes) => {
      const prevPos = new Map(prevNodes.map((n) => [n.id, n.position]));
      return blocks.map<Node>((block) => {
        const data: WorkflowNodeData = {
          block,
          modelName: models.find((m) => m.modelType === block.model)?.name,
          progress: block._progress,
          selected: selectedIds.includes(block.id),
          editing: editingBlockId === block.id,
          parentRefs: block.parentBlockIds.map((pid) => {
            const parent = blockById.get(pid);
            return {
              url: parent?.outputUrl ?? "",
              type: parent?.type ?? "image",
            };
          }),
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
              ? palette.warning
              : palette.success
            : palette.textDim;
          return {
            id: `${parentId}->${child.id}`,
            source: parentId,
            target: child.id,
            animated: parentSuccess && childProcessing,
            style: {
              stroke,
              strokeWidth: 2,
              strokeLinecap: "round",
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
    palette,
    models,
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

  // ชิปสรุปสถานะ (จาง count ที่เป็น 0 เพื่อลดสัญญาณรบกวน)
  const statusItems: { label: string; count: number; color: string }[] = [
    { label: "Pending", count: counts.pending, color: palette.textDim },
    { label: "Processing", count: counts.processing, color: palette.warning },
    { label: "Success", count: counts.success, color: palette.success },
    { label: "Failed", count: counts.failed, color: palette.error },
  ];

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{ ...paletteVars, background: palette.canvasBg }}
    >
      {/* Unified toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2.5"
        style={{
          background: palette.headerBg,
          borderBottom: `1px solid ${palette.border}`,
        }}
      >
        <Button
          type="text"
          size="small"
          icon={<ArrowLeft size={16} />}
          onClick={() => router.push(`/page/project/${projectId}`)}
          style={{ color: palette.textDim, flexShrink: 0 }}
        >
          Back
        </Button>

        <div
          style={{ width: 1, height: 20, background: palette.border, flexShrink: 0 }}
        />

        <span
          className="truncate"
          style={{
            fontWeight: 600,
            color: palette.text,
            maxWidth: 220,
            flexShrink: 0,
          }}
          title={conversationName}
        >
          {conversationName || "Untitled workflow"}
        </span>

        {/* Status cluster */}
        <div
          className="flex items-center gap-1 ml-1 px-2 py-1 rounded-lg"
          style={{ background: palette.canvasBg, border: `1px solid ${palette.border}` }}
        >
          {statusItems.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1.5 px-1.5"
              style={{
                fontSize: 12,
                color: palette.text,
                opacity: s.count === 0 ? 0.4 : 1,
              }}
              title={`${s.label} ${s.count}`}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: s.color,
                  display: "inline-block",
                }}
              />
              {s.count}
            </span>
          ))}
        </div>

        {/* Est. credit */}
        <span
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
          style={{
            fontSize: 12,
            color: palette.primary,
            background: palette.canvasBg,
            border: `1px solid ${palette.border}`,
          }}
          title="Estimated credit for this workflow"
        >
          <Coins size={13} />
          {totalEstimate}
        </span>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Button
              type="dashed"
              icon={<Layers size={15} />}
              onClick={handleCombine}
            >
              Combine {selectedIds.length}{" "}
              {selectedIds.length === 1 ? "block" : "blocks"}
            </Button>
          )}
          {/* <Button icon={<Play size={15} />} onClick={handleRunAll}>
            Run all
          </Button> */}
          <Dropdown
            menu={{
              items: [
                { key: "image", label: "Image block", icon: <ImageIcon size={14} /> },
                { key: "video", label: "Video block", icon: <VideoIcon size={14} /> },
              ],
              onClick: ({ key }) => handleNewBlock(key as WorkflowBlockType),
            }}
          >
            <Button type="primary" icon={<Plus size={15} />}>
              New block
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 relative">
        {loaded && blocks.length === 0 && (
          <div className="wf-empty">
            <Sparkles size={28} color={palette.primary} />
            <div style={{ fontSize: 15, fontWeight: 600, color: palette.text }}>
              Start your workflow
            </div>
            <div style={{ fontSize: 13, maxWidth: 340 }}>
              Use <b>New block</b> to generate an image or video, then press +
              on the result to keep building from it.
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          fitView
          proOptions={{ hideAttribution: true }}
          style={{ background: palette.canvasBg }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={palette.dot}
          />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default WorkflowCanvas;
