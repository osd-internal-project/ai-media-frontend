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
} from "antd";
import { History, MessageSquare, Sparkles } from "lucide-react";
import { axiosChatAssistant } from "@/app/lib/axios/axios";
import ChatAssistantService from "@/app/services/chat-assistant.service";
import type {
  ChatGenerateType,
  ChatModelOption,
  Conversation,
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");
  const [models, setModels] = useState<ChatModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const esRef = useRef<AuthEventStream | null>(null);

  // `session.user.id` เป็น access token ไม่ใช่ users.userId — backend ตรวจสมาชิก
  // ขององค์กรด้วย userId ตัวจริง ถ้าส่ง token ไปจะถูกปฏิเสธทุกครั้ง
  // (และเดิมประวัติแชทถูกผูกกับ token ที่หมุนเปลี่ยน ทำให้ประวัติหายเป็นระยะ)
  const { userId, organizationId } = useOrgIdentity();

  // ── Greeting ───────────────────────────────────────────
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  // ── Load conversations ──────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    const list = await service.listConversations(userId);
    setConversations(
      (list ?? []).sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime(),
      ),
    );
  }, [userId, service]);

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
    loadMessages(data.id);
  }, [userId, organizationId, projectId, service, loadMessages]);

  useEffect(() => {
    if (openAssistant) setConversationChat();
  }, [openAssistant, setConversationChat]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load selectable models ──────────────────────────────
  useEffect(() => {
    if (!openAssistant) return;
    let cancelled = false;

    service.listChatModels().then((rows) => {
      if (cancelled) return;
      setModels(rows);
      // ตั้งค่าเริ่มต้นครั้งเดียว — ไม่ทับตัวเลือกที่ผู้ใช้เพิ่งเปลี่ยน
      setSelectedModel(
        (current) => current ?? rows.find((row) => row.isDefault)?.modelId,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [openAssistant, service]);

  // ── Append message to draft ─────────────────────────────
  const handleAppendToDraft = useCallback((content: string) => {
    setDraftPrompt((prev) => (prev ? `${prev}\n${content}` : content));
  }, []);

  // ── Use Prompt ──────────────────────────────────────────
  const handleUsePrompt = useCallback(() => {
    onUsePrompt?.(draftPrompt.trim());
    setOpenAssistant(false);
  }, [draftPrompt, onUsePrompt, setOpenAssistant]);

  // ── Send message (streaming) ────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      let convId = activeConvId;
      const isFirstMessage =
        messages.filter((m) => m.role === "user").length === 0;

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
          antMessage.error("Failed to create conversation.");
          return;
        }
        convId = conv.id;
        setActiveConvId(convId);
        await loadConversations();
      }

      const optimisticUserMsg: Message = {
        id: `tmp-user-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      setIsStreaming(true);
      setStreamingContent("");

      // ข้อความยังไปทาง query string เหมือนเดิม — token ไปทาง header (openAuthEventStream)
      const url = new URL(`${CHAT_ASSISTANT_BASE_URL}/chat/stream`);
      url.searchParams.set("userId", userId);
      url.searchParams.set("organizationId", organizationId);
      url.searchParams.set("message", text);
      url.searchParams.set("conversationId", convId);
      if (generateType) url.searchParams.set("generateType", generateType);
      if (selectedModel) url.searchParams.set("model", selectedModel);

      let accumulated = "";
      const assistantMsgId = `tmp-assistant-${Date.now()}`;

      const es = openAuthEventStream(url.toString());
      esRef.current = es;

      es.onmessage = (event) => {
        try {
          const chunk: StreamChunk = JSON.parse(event.data);

          if (chunk.type === "content" && chunk.delta) {
            accumulated += chunk.delta;
            setStreamingContent(accumulated);
          } else if (chunk.type === "done") {
            es.close();
            esRef.current = null;
            setIsStreaming(false);
            setStreamingContent("");

            const assistantMsg: Message = {
              id: chunk.messageId ?? assistantMsgId,
              role: "assistant",
              content: accumulated,
              createdAt: new Date().toISOString(),
              tokenUsage: chunk.tokenUsage,
            };
            setMessages((prev) => [...prev, assistantMsg]);

            (async () => {
              if (isFirstMessage && convId) {
                const currentConv = conversations.find((c) => c.id === convId);
                if (!currentConv || currentConv.title === "New Chat") {
                  const newTitle = text.slice(0, 60);
                  await service.updateConversation(convId, userId, newTitle);
                  setConversations((prev) =>
                    prev.map((c) =>
                      c.id === convId
                        ? { ...c, title: newTitle, updatedAt: new Date().toISOString() }
                        : c,
                    ),
                  );
                }
              }
              loadConversations();
            })();
          } else if (chunk.type === "error") {
            es.close();
            esRef.current = null;
            setIsStreaming(false);
            setStreamingContent("");
            antMessage.error(chunk.error ?? "Streaming error occurred.");
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        setIsStreaming(false);
        setStreamingContent("");
        if (accumulated) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMsgId,
              role: "assistant",
              content: accumulated,
              createdAt: new Date().toISOString(),
            },
          ]);
        } else {
          antMessage.error("Connection lost. Please try again.");
        }
      };
    },
    [
      isStreaming,
      activeConvId,
      messages,
      conversations,
      userId,
      organizationId,
      generateType,
      selectedModel,
      service,
      loadConversations,
    ],
  );

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

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
      onCancel={() => setOpenAssistant(false)}
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
                Click <strong style={{ color: token.colorPrimary }}>+ Use</strong> on any assistant message to add it here. You can also edit freely.
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
              <Button
                type="text"
                shape="circle"
                icon={
                  <History
                    className="h-5 w-5"
                    style={{ color: token.colorTextSecondary }}
                  />
                }
                onClick={() => setSidebarOpen((p) => !p)}
              />
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
              options={models.map((model) => ({
                value: model.modelId,
                label: model.displayName,
                title: model.description ?? undefined,
              }))}
            />
          </div>

          <>
              {!activeConvId && (
                <div className="flex flex-1 flex-col items-center justify-center px-4 -mt-10">
                  <div className="w-full max-w-[700px] flex flex-col items-center text-center">
                    <h1
                      className="text-4xl font-normal tracking-tight mb-2"
                      style={{ color: token.colorTextBase }}
                    >
                      {greeting},
                    </h1>
                    <h2
                      className="text-4xl font-normal tracking-tight mb-10"
                      style={{ color: token.colorTextBase }}
                    >
                      What do you want to create?
                    </h2>
                  </div>
                </div>
              )}

              {activeConvId && (
                <ChatWindow
                  messages={messages}
                  isStreaming={isStreaming}
                  streamingContent={streamingContent}
                  onAppendMessage={handleAppendToDraft}
                />
              )}

              <ChatInput
                onSend={handleSend}
                disabled={isStreaming || loadingMsgs}
                placeholder={
                  activeConvId
                    ? "Message the assistant..."
                    : "Start typing to begin a new chat..."
                }
              />
          </>
        </main>
      </div>
    </Modal>
  );
};

export default AssistantModal;
