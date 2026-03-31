"use client";
import { theme, Typography } from "antd";
import { ChevronDown, Wrench } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/app/services/chat-assistant.types";
import TokenBadge from "./TokenBadge";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { token } = theme.useToken();
  const [toolExpanded, setToolExpanded] = useState(false);

  // system messages are hidden
  if (message.role === "system") return null;

  // tool message – collapsed card
  if (message.role === "tool") {
    return (
      <div className="flex justify-start mb-3">
        <button
          onClick={() => setToolExpanded((p) => !p)}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors"
          style={{
            backgroundColor: token.colorFillAlter,
            border: `1px solid ${token.colorBorder}`,
            color: token.colorTextSecondary,
          }}
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>Tool called</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${toolExpanded ? "rotate-180" : ""}`}
          />
        </button>
        {toolExpanded && (
          <pre
            className="ml-2 rounded-xl px-3 py-2 text-xs max-w-[480px] overflow-auto"
            style={{ backgroundColor: token.colorFillAlter, color: token.colorTextBase }}
          >
            {message.content}
          </pre>
        )}
      </div>
    );
  }

  const isUser = message.role === "user";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
          style={{
            backgroundColor: isUser ? token.colorPrimary : token.colorBgContainer,
            color: isUser ? "#fff" : token.colorTextBase,
            border: isUser ? "none" : `1px solid ${token.colorBorder}`,
            borderBottomRightRadius: isUser ? "4px" : "16px",
            borderBottomLeftRadius: isUser ? "16px" : "4px",
          }}
        >
          {message.content}
        </div>
        {!isUser && message.tokenUsage && (
          <div className="px-1">
            <TokenBadge
              totalTokens={message.tokenUsage.totalTokens}
              model={message.tokenUsage.model}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
