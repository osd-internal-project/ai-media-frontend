"use client";
import { useEffect, useRef } from "react";
import { theme } from "antd";
import type { Message } from "@/app/services/chat-assistant.types";
import MessageBubble from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onAppendMessage?: (content: string) => void;
}

const TypingDots = () => {
  const { token } = theme.useToken();
  return (
    <div className="flex justify-start mb-4">
      <div
        className="flex items-center gap-1.5 rounded-2xl rounded-bl-[4px] px-4 py-3"
        style={{ backgroundColor: token.colorBgContainer, border: `1px solid ${token.colorBorder}` }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full animate-bounce"
            style={{
              backgroundColor: token.colorTextTertiary,
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.9s",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const ChatWindow = ({ messages, isStreaming, streamingContent, onAppendMessage }: ChatWindowProps) => {
  const { token } = theme.useToken();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 hide-scrollbar">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onAppendMessage={onAppendMessage} />
      ))}

      {isStreaming && streamingContent && (
        <div className="flex justify-start mb-4">
          <div
            className="rounded-2xl rounded-bl-[4px] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words max-w-[75%]"
            style={{
              backgroundColor: token.colorBgContainer,
              color: token.colorTextBase,
              border: `1px solid ${token.colorBorder}`,
            }}
          >
            {streamingContent}
          </div>
        </div>
      )}

      {isStreaming && !streamingContent && <TypingDots />}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
