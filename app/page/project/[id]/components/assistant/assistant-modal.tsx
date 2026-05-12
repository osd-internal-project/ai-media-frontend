"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  theme,
  Typography,
  message as antMessage,
  Segmented,
  Modal,
  Input,
} from "antd";
import { History, MessageSquare, Sparkles } from "lucide-react";
import { axiosChatAssistant } from "@/app/lib/axios/axios";
import ChatAssistantService from "@/app/services/chat-assistant.service";
import type {
  Conversation,
  Message,
  StreamChunk,
} from "@/app/services/chat-assistant.types";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import ImageToPromptPanel from "./components/ImageToPromptPanel";

interface Props {
  openAssistant: boolean;
  setOpenAssistant: (open: boolean) => void;
  projectId: string;
  onUsePrompt?: (text: string) => void;
}

const { Text } = Typography;
const { TextArea } = Input;
const CHAT_ASSISTANT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL_CHAT_ASSISTANT ??
  "http://localhost:4004/api/chat-assistant";

const AssistantModal: React.FC<Props> = ({
  openAssistant,
  setOpenAssistant,
  projectId,
  onUsePrompt,
}) => {
  const { data: session } = useSession();
  const { token } = theme.useToken();
  const service = useMemo(() => ChatAssistantService(axiosChatAssistant), []);

  // ── State ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"chat" | "image-to-prompt">("chat");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [draftPrompt, setDraftPrompt] = useState("");
  const esRef = useRef<EventSource | null>(null);

  const userId = session?.user?.id ?? "";
  const organizationId = session?.user?.organizationId ?? "";

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
    setLoadingConvs(true);
    const list = await service.listConversations(userId);
    if (list) {
      setConversations(
        list.sort(
          (a, b) =>
            new Date(b.updatedAt ?? b.createdAt).getTime() -
            new Date(a.updatedAt ?? a.createdAt).getTime(),
        ),
      );
    }
    setLoadingConvs(false);
  }, [userId, service]);

  useEffect(() => {
    if (openAssistant) {
      setConversationChat();
    }
  }, [openAssistant]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // ── Load messages ───────────────────────────────────────
  const loadMessages = useCallback(
    async (convId: string) => {
      setLoadingMsgs(true);
      const msgs = await service.getMessages(convId);
      setMessages(msgs);
      setLoadingMsgs(false);
    },
    [service],
  );

  const setConversationChat = async () => {
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
  };

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id === activeConvId) return;
      esRef.current?.close();
      setIsStreaming(false);
      setStreamingContent("");
      setActiveConvId(id);
      loadMessages(id);
    },
    [activeConvId, loadMessages],
  );

  // ── New Chat ────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    if (!userId) return;
    setLoadingConvs(true);
    const conv = await service.createConversation({
      userId,
      organizationId,
      title: "New Chat",
    });
    if (conv) {
      await loadConversations();
      setActiveConvId(conv.id);
      setMessages([]);
    }
    setLoadingConvs(false);
  }, [userId, organizationId, service, loadConversations]);

  // ── Continue to Chat ────────────────────────────────────
  const handleContinueChat = useCallback(
    (id: string) => {
      setActiveTab("chat");
      handleSelectConversation(id);
    },
    [handleSelectConversation],
  );

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = useCallback(
    async (id: string) => {
      await service.deleteConversation(id);
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      setConversations((prev) => prev.filter((c) => c.id !== id));
    },
    [activeConvId, service],
  );

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

      if (!convId) {
        if (!userId) {
          antMessage.error("Please log in to use the assistant.");
          return;
        }
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

      const url = new URL(`${CHAT_ASSISTANT_BASE_URL}/chat/stream`);
      url.searchParams.set("userId", userId);
      url.searchParams.set("message", text);
      url.searchParams.set("conversationId", convId);

      let accumulated = "";
      const assistantMsgId = `tmp-assistant-${Date.now()}`;

      const es = new EventSource(url.toString());
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
                  await service.updateConversation(convId, newTitle);
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
      userId,
      organizationId,
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

  const activeConv = conversations.find((c) => c.id === activeConvId);

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
                {activeTab === "chat" ? "Chat Assistant" : "Image to Prompt"}
              </Text>
            </div>

            <Segmented
              value={activeTab}
              onChange={(value) => setActiveTab(value as "chat" | "image-to-prompt")}
              options={[
                { label: "Chat", value: "chat" },
              ]}
            />
          </div>

          {activeTab === "image-to-prompt" ? (
            <ImageToPromptPanel
              userId={userId}
              organizationId={organizationId}
              onContinueChat={handleContinueChat}
            />
          ) : (
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
          )}
        </main>
      </div>
    </Modal>
  );
};

export default AssistantModal;
