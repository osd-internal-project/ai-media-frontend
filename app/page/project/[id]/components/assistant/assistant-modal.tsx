"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  theme,
  Typography,
  message as antMessage,
  Select,
  Modal,
  Input,
  Tag,
  Tooltip,
} from "antd";
import { MessageSquare, PanelLeft, Sparkles } from "lucide-react";
import { axiosChatAssistant } from "@/app/lib/axios/axios";
import ChatAssistantService from "@/app/services/chat-assistant.service";
import type {
  ChatGenerateType,
  ChatModelOption,
  Message,
  StreamChunk,
} from "@/app/services/chat-assistant.types";
import { useOrgIdentity } from "@/app/hooks/useOrgIdentity";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import {
  AuthEventStream,
  openAuthEventStream,
} from "@/app/lib/sse/auth-event-stream";

interface Props {
  openAssistant: boolean;
  setOpenAssistant: (open: boolean) => void;
  projectId: string;
  /** แท็บ generate ที่เปิดอยู่ — กำหนดบทบาทของผู้ช่วย */
  generateType?: ChatGenerateType;
  onUsePrompt?: (text: string) => void;
}

const { Text } = Typography;
const { TextArea } = Input;
const CHAT_ASSISTANT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL_CHAT_ASSISTANT ??
  "http://localhost:4004/api/chat-assistant";

/** คำที่ใช้เรียกแต่ละแท็บให้ผู้ใช้เห็นว่าผู้ช่วยกำลังสวมบทบาทไหน */
const ROLE_LABELS: Record<ChatGenerateType, string> = {
  image: "image prompt",
  video: "video prompt",
  omnihumen: "avatar prompt",
  dreamactor: "motion prompt",
};

/** หน้าว่างของแต่ละแท็บ — บอกว่าต้องพิมพ์อะไร และมีตัวอย่างให้กดเริ่มได้ทันที */
const EMPTY_STATES: Record<ChatGenerateType | "default", { heading: string; starters: string[] }> = {
  image: {
    heading: "Describe the image you want to make.",
    starters: [
      "A product shot of iced coffee for an Instagram ad",
      "A cosy bedroom at golden hour, editorial style",
      "A mascot character for a kids' learning app",
    ],
  },
  video: {
    heading: "Describe the video shot you want to make.",
    starters: [
      "A slow dolly-in on a steaming bowl of noodles",
      "Drone shot over a beach at sunrise",
      "A sneaker spinning on a pedestal, studio lighting",
    ],
  },
  omnihumen: {
    heading: "Describe the presenter you want on screen.",
    starters: [
      "A friendly bank advisor explaining a savings plan",
      "An energetic fitness coach, half body, gym background",
      "A calm news anchor in a modern studio",
    ],
  },
  dreamactor: {
    heading: "Describe the character and the motion it should perform.",
    starters: [
      "A cartoon chef doing a celebratory dance",
      "A knight in armour bowing slowly",
      "A street dancer doing a smooth wave",
    ],
  },
  default: {
    heading: "Describe what you want to make.",
    starters: [
      "An image for a coffee shop promotion",
      "A short video of a city at night",
    ],
  },
};

const AssistantModal: React.FC<Props> = ({
  openAssistant,
  setOpenAssistant,
  projectId,
  generateType,
  onUsePrompt,
}) => {
  const { token } = theme.useToken();
  const service = useMemo(() => ChatAssistantService(axiosChatAssistant), []);

  // ── State ──────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [models, setModels] = useState<ChatModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const esRef = useRef<AuthEventStream | null>(null);
  // ข้อความที่ stream มาแล้ว — Stop ต้องอ่านได้นอก handler ของ stream
  const accumulatedRef = useRef("");

  // `session.user.id` เป็น access token ไม่ใช่ users.userId — backend ตรวจสมาชิก
  // ขององค์กรด้วย userId ตัวจริง ถ้าส่ง token ไปจะถูกปฏิเสธทุกครั้ง
  // (และเดิมประวัติแชทถูกผูกกับ token ที่หมุนเปลี่ยน ทำให้ประวัติหายเป็นระยะ)
  const { userId, organizationId } = useOrgIdentity();

  const emptyState = EMPTY_STATES[generateType ?? "default"];

  // ── Load messages ───────────────────────────────────────
  const loadMessages = useCallback(
    async (convId: string) => {
      setLoadingMsgs(true);
      setMessages(await service.getMessages(convId, userId));
      setLoadingMsgs(false);
    },
    [service, userId],
  );

  /** เปิดบทสนทนาของ project นี้ (สร้างให้ถ้ายังไม่มี) */
  const setConversationChat = useCallback(async () => {
    if (!userId || !organizationId) return;
    const data = await service.setConversation({
      userId,
      organizationId,
      projectId,
    });
    if (!data) return;
    esRef.current?.close();
    setIsStreaming(false);
    setStreamingContent("");
    setActiveConvId(data.id);
    // ใช้โมเดลที่บทสนทนานี้จำไว้ — ถ้าปิดใช้ไปแล้ว effect ด้านล่างจะตกไปใช้ default
    setSelectedModel(data.model ?? undefined);
    loadMessages(data.id);
  }, [userId, organizationId, projectId, service, loadMessages]);

  useEffect(() => {
    if (openAssistant) setConversationChat();
  }, [openAssistant, setConversationChat]);

  // ── Load selectable models ──────────────────────────────
  useEffect(() => {
    if (!openAssistant) return;
    let cancelled = false;

    service.listChatModels().then((rows) => {
      if (!cancelled) setModels(rows);
    });

    return () => {
      cancelled = true;
    };
  }, [openAssistant, service]);

  // โมเดลที่เลือกต้องอยู่ในรายการที่เปิดใช้ ไม่งั้น backend ตอบ "not available"
  useEffect(() => {
    if (models.length === 0) return;
    if (models.some((model) => model.modelId === selectedModel)) return;
    setSelectedModel(models.find((model) => model.isDefault)?.modelId ?? models[0].modelId);
  }, [models, selectedModel]);

  // ── Append message to draft ─────────────────────────────
  const handleAppendToDraft = useCallback((content: string) => {
    setDraftPrompt((prev) => (prev ? `${prev}\n${content}` : content));
  }, []);

  // ── Stop streaming ──────────────────────────────────────
  /** หยุดคำตอบ — เก็บส่วนที่ได้มาแล้วไว้ให้ใช้ต่อได้ */
  const stopStreaming = useCallback(() => {
    if (!esRef.current) return;
    esRef.current.close();
    esRef.current = null;
    setIsStreaming(false);
    setStreamingContent("");
    const partial = accumulatedRef.current;
    if (partial) {
      setMessages((prev) => [
        ...prev,
        {
          id: `tmp-assistant-${Date.now()}`,
          role: "assistant",
          content: partial,
          createdAt: new Date().toISOString(),
          truncated: true,
        },
      ]);
    }
  }, []);

  const closeModal = useCallback(() => {
    stopStreaming();
    setOpenAssistant(false);
  }, [stopStreaming, setOpenAssistant]);

  // ── Use Prompt ──────────────────────────────────────────
  const handleUsePrompt = useCallback(() => {
    onUsePrompt?.(draftPrompt.trim());
    closeModal();
  }, [draftPrompt, onUsePrompt, closeModal]);

  // ── Send message (streaming) ────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      let convId = activeConvId;

      if (!userId || !organizationId) {
        antMessage.error("Please log in and select an organization.");
        return;
      }

      if (!convId) {
        const conv = await service.createConversation({
          userId,
          organizationId,
          title: text.slice(0, 60) || "New Chat",
        });
        if (!conv) {
          antMessage.error("Couldn't start a conversation. Try again.");
          return;
        }
        convId = conv.id;
        setActiveConvId(convId);
      }

      const userMsgId = `tmp-user-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: text, createdAt: new Date().toISOString() },
      ]);

      setIsStreaming(true);
      setStreamingContent("");
      accumulatedRef.current = "";

      // ข้อความยังไปทาง query string เหมือนเดิม — token ไปทาง header (openAuthEventStream)
      const url = new URL(`${CHAT_ASSISTANT_BASE_URL}/chat/stream`);
      url.searchParams.set("userId", userId);
      url.searchParams.set("organizationId", organizationId);
      url.searchParams.set("message", text);
      url.searchParams.set("conversationId", convId);
      if (generateType) url.searchParams.set("generateType", generateType);
      if (selectedModel) url.searchParams.set("model", selectedModel);

      const es = openAuthEventStream(url.toString());
      esRef.current = es;

      const finish = () => {
        es.close();
        esRef.current = null;
        setIsStreaming(false);
        setStreamingContent("");
      };

      /** ยังไม่ได้คำตอบเลย — ติดเหตุผลไว้ที่ข้อความของผู้ใช้ให้กดส่งใหม่ได้ */
      const markFailed = (reason: string) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, error: reason } : m)),
        );
      };

      const keepPartial = (truncated: boolean, tokenUsage?: StreamChunk["tokenUsage"], id?: string) => {
        setMessages((prev) => [
          ...prev,
          {
            id: id ?? `tmp-assistant-${Date.now()}`,
            role: "assistant",
            content: accumulatedRef.current,
            createdAt: new Date().toISOString(),
            tokenUsage,
            truncated,
          },
        ]);
      };

      es.onmessage = (event) => {
        let chunk: StreamChunk;
        try {
          chunk = JSON.parse(event.data);
        } catch {
          console.warn("[ChatAssistant] unparseable stream chunk:", event.data);
          return;
        }

        if (chunk.type === "content" && chunk.delta) {
          accumulatedRef.current += chunk.delta;
          setStreamingContent(accumulatedRef.current);
        } else if (chunk.type === "done") {
          finish();
          keepPartial(chunk.finishReason === "length", chunk.tokenUsage, chunk.messageId);
        } else if (chunk.type === "error") {
          finish();
          const reason = chunk.error ?? "The assistant couldn't answer.";
          if (accumulatedRef.current) {
            keepPartial(true);
            antMessage.error(reason);
          } else {
            markFailed(reason);
          }
        }
      };

      es.onerror = (reason) => {
        finish();
        if (accumulatedRef.current) {
          keepPartial(true);
        } else {
          markFailed(reason ?? "Connection lost. Check your network.");
        }
      };
    },
    [
      isStreaming,
      activeConvId,
      userId,
      organizationId,
      generateType,
      selectedModel,
      service,
    ],
  );

  const handleRetry = useCallback(
    (failed: Message) => {
      setMessages((prev) => prev.filter((m) => m.id !== failed.id));
      handleSend(failed.content);
    },
    [handleSend],
  );

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  const showEmptyState = !loadingMsgs && messages.length === 0 && !isStreaming;

  // ── Render ──────────────────────────────────────────────
  return (
    <Modal
      open={openAssistant}
      centered={false}
      width="85%"
      style={{ top: "5vh", padding: 0 }}
      styles={{
        content: {
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          backgroundColor: token.colorBgBase,
          border: `1px solid ${token.colorBorder}`,
        },
        header: {
          padding: "12px 16px",
          margin: 0,
          borderBottom: `1px solid ${token.colorBorder}`,
          backgroundColor: token.colorBgContainer,
        },
        body: {
          flex: 1,
          overflow: "hidden",
          padding: 0,
          display: "flex",
          minHeight: 0,
        },
      }}
      footer={null}
      onCancel={closeModal}
      maskClosable={false}
      title={
        <div className="flex items-center gap-2">
          <Sparkles
            className="h-4 w-4"
            style={{ color: token.colorPrimary }}
          />
          <span
            style={{
              background: `linear-gradient(90deg, ${token.colorPrimary}, ${token.colorPrimaryActive ?? token.colorPrimary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            AI Prompt Assistant
          </span>
        </div>
      }
    >
      <div
        className="flex h-full w-full overflow-hidden"
        style={{ backgroundColor: token.colorBgBase }}
      >
        {/* Sidebar — draft prompt area */}
        {sidebarOpen && (
          <aside
            className="flex flex-col shrink-0 border-r"
            style={{
              width: 280,
              backgroundColor: token.colorBgContainer,
              borderColor: token.colorBorder,
            }}
          >
            {/* Sidebar header */}
            <div
              className="flex h-14 shrink-0 items-center gap-2 border-b px-4"
              style={{ borderColor: token.colorBorder }}
            >
              <MessageSquare
                className="h-4 w-4"
                style={{ color: token.colorPrimary }}
              />
              <Text className="text-sm font-semibold">Prompt Draft</Text>
            </div>

            {/* Draft textarea + Use Prompt button */}
            <div
              className="flex flex-col flex-1 p-3 gap-3 min-h-0"
            >
              <Text
                style={{ fontSize: 11, color: token.colorTextSecondary, flexShrink: 0 }}
              >
                Click <strong style={{ color: token.colorPrimary }}>Use</strong> on a prompt to add it here. You can also edit freely.
              </Text>

              <TextArea
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                placeholder="Selected prompt content will appear here..."
                style={{
                  flex: 1,
                  resize: "none",
                  backgroundColor: token.colorBgElevated,
                  color: token.colorTextBase,
                  borderColor: token.colorBorder,
                  borderRadius: 8,
                  fontSize: 13,
                  lineHeight: 1.6,
                  minHeight: 0,
                }}
                styles={{ textarea: { height: "100%", minHeight: "120px" } }}
              />

              <Button
                type="primary"
                block
                disabled={!draftPrompt.trim()}
                onClick={handleUsePrompt}
                style={{
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 38,
                  flexShrink: 0,
                }}
              >
                Use Prompt
              </Button>

              {draftPrompt.trim() && (
                <Button
                  type="text"
                  block
                  size="small"
                  onClick={() => setDraftPrompt("")}
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: 12,
                    height: 28,
                    flexShrink: 0,
                  }}
                >
                  Clear draft
                </Button>
              )}
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <main className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* Top bar */}
          <div
            className="flex h-14 shrink-0 items-center justify-between border-b px-4"
            style={{
              backgroundColor: token.colorBgContainer,
              borderColor: token.colorBorder,
            }}
          >
            <div className="flex items-center gap-3">
              <Tooltip title={sidebarOpen ? "Hide prompt draft" : "Show prompt draft"}>
                <Button
                  type="text"
                  shape="circle"
                  aria-label={sidebarOpen ? "Hide prompt draft" : "Show prompt draft"}
                  icon={
                    <PanelLeft
                      className="h-5 w-5"
                      style={{ color: token.colorTextSecondary }}
                    />
                  }
                  onClick={() => setSidebarOpen((p) => !p)}
                />
              </Tooltip>
              <Text
                className="text-sm font-medium truncate"
                style={{ color: token.colorTextBase }}
              >
                Chat Assistant
              </Text>
              {/* บอกให้ผู้ใช้เห็นว่าผู้ช่วยกำลังเขียน prompt ของแท็บไหนอยู่ */}
              {generateType && (
                <Tag color="processing" style={{ marginInlineEnd: 0 }}>
                  {ROLE_LABELS[generateType]}
                </Tag>
              )}
            </div>

            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              placeholder="Model"
              size="small"
              style={{ minWidth: 190 }}
              disabled={isStreaming}
              options={models.map((model) => ({
                value: model.modelId,
                label: model.displayName,
                title: model.description ?? undefined,
              }))}
            />
          </div>

          {showEmptyState ? (
            <div className="flex flex-1 flex-col justify-center px-6">
              <div className="mx-auto w-full max-w-[640px]">
                <h2
                  className="mb-4"
                  style={{ color: token.colorTextBase, fontSize: 22, fontWeight: 500 }}
                >
                  {emptyState.heading}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {emptyState.starters.map((starter) => (
                    <Button key={starter} onClick={() => handleSend(starter)}>
                      {starter}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ChatWindow
              messages={messages}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
              onAppendMessage={handleAppendToDraft}
              onRetry={handleRetry}
            />
          )}

          <ChatInput
            onSend={handleSend}
            disabled={isStreaming || loadingMsgs}
            isStreaming={isStreaming}
            onStop={stopStreaming}
            placeholder="Describe what you want, or ask for changes..."
          />
        </main>
      </div>
    </Modal>
  );
};

export default AssistantModal;
