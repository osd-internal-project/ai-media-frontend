"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button, theme, Typography, message as antMessage } from "antd";
import { History, MessageSquare } from "lucide-react";
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

const { Text } = Typography;

const CHAT_ASSISTANT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL_CHAT_ASSISTANT ??
  "http://localhost:4004/api/chat-assistant";

const AssistantPage = () => {
  const { data: session } = useSession();
  const { token } = theme.useToken();
  const service = useMemo(() => ChatAssistantService(axiosChatAssistant), []);

  // ── State ──────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
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
    setConversations(list.sort((a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime()));
    setLoadingConvs(false);
  }, [userId, service]);

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
    [service]
  );

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (id === activeConvId) return;
      // cancel any running stream
      esRef.current?.close();
      setIsStreaming(false);
      setStreamingContent("");
      setActiveConvId(id);
      loadMessages(id);
    },
    [activeConvId, loadMessages]
  );

  // ── New Chat ────────────────────────────────────────────
  const handleNewChat = useCallback(async () => {
    if (!userId) return;
    setLoadingConvs(true);
    const conv = await service.createConversation({ userId, organizationId, title: "New Chat" });
    if (conv) {
      await loadConversations();
      setActiveConvId(conv.id);
      setMessages([]);
    }
    setLoadingConvs(false);
  }, [userId, organizationId, service, loadConversations]);

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
    [activeConvId, service]
  );

  // ── Send message (streaming) ────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;

      let convId = activeConvId;

      // Auto-create conversation if none active
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

      // Optimistically add user message
      const optimisticUserMsg: Message = {
        id: `tmp-user-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUserMsg]);

      // Start streaming
      setIsStreaming(true);
      setStreamingContent("");

      const url = new URL(`${CHAT_ASSISTANT_BASE_URL}/chat/stream`);
      url.searchParams.set("userId", userId);
      url.searchParams.set("message", text);
      url.searchParams.set("conversationId", convId);

      let accumulated = "";
      let assistantMsgId = `tmp-assistant-${Date.now()}`;

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

            // Append the completed assistant message
            const assistantMsg: Message = {
              id: chunk.messageId ?? assistantMsgId,
              role: "assistant",
              content: accumulated,
              createdAt: new Date().toISOString(),
              tokenUsage: chunk.tokenUsage,
            };
            setMessages((prev) => [...prev, assistantMsg]);

            // Refresh conversation list (title may have updated)
            loadConversations();
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
          // Still save whatever was received
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
    ]
  );

  // ── Cleanup on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  // ── Active conversation title ───────────────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId);

  // ── Render ──────────────────────────────────────────────
  return (
    <div
      className="flex h-full w-full overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: token.colorBgBase, color: token.colorTextBase }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          className="flex h-full flex-col border-r transition-all duration-300 shrink-0"
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
            <MessageSquare className="h-5 w-5" style={{ color: token.colorPrimary }} />
            <Text className="text-sm font-semibold">Assistant</Text>
          </div>

          <ConversationList
            conversations={conversations}
            activeConversationId={activeConvId ?? undefined}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
            onDelete={handleDelete}
            loading={loadingConvs}
          />
        </aside>
      )}

      {/* Main chat area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div
          className="flex h-14 shrink-0 items-center gap-3 border-b px-4"
          style={{
            backgroundColor: token.colorBgContainer,
            borderColor: token.colorBorder,
          }}
        >
          <Button
            type="text"
            shape="circle"
            icon={<History className="h-5 w-5" style={{ color: token.colorTextSecondary }} />}
            onClick={() => setSidebarOpen((p) => !p)}
          />
          <Text className="text-sm font-medium truncate" style={{ color: token.colorTextBase }}>
            {activeConv?.title ?? "Chat Assistant"}
          </Text>
        </div>

        {/* Empty state */}
        {!activeConvId && (
          <div className="flex flex-1 flex-col items-center justify-center px-4 -mt-10">
            <div className="w-full max-w-[700px] flex flex-col items-center text-center">
              <h1 className="text-4xl font-normal tracking-tight mb-2" style={{ color: token.colorTextBase }}>
                {greeting},
              </h1>
              <h2 className="text-4xl font-normal tracking-tight mb-10" style={{ color: token.colorTextBase }}>
                What do you want to create?
              </h2>
            </div>
          </div>
        )}

        {/* Messages */}
        {activeConvId && (
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
          />
        )}

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming || loadingMsgs}
          placeholder={
            activeConvId ? "Message the assistant..." : "Start typing to begin a new chat..."
          }
        />
      </main>
    </div>
  );
};

export default AssistantPage;
