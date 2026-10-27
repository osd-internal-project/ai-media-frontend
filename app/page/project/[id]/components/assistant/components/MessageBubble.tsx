"use client";
import { Button, theme, Typography } from "antd";
import { ChevronDown, Plus, RotateCcw, Wrench } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/app/services/chat-assistant.types";
import MessageContent, { splitPrompt } from "./MessageContent";
import TokenBadge from "./TokenBadge";

interface MessageBubbleProps {
  message: Message;
  onAppendMessage?: (content: string) => void;
  onRetry?: (message: Message) => void;
}

const MessageBubble = ({ message, onAppendMessage, onRetry }: MessageBubbleProps) => {
  const { token } = theme.useToken();
  const [toolExpanded, setToolExpanded] = useState(false);

  if (message.role === "system") return null;

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

  // assistant ที่ขอ tool แต่ไม่มีข้อความ — ไม่มีอะไรให้แสดง
  if (!message.content) return null;

  const isUser = message.role === "user";
  // ไม่มี prompt card (คำตอบเก่า/โมเดลไม่ทำตาม) — ให้ Use ทั้งข้อความแทน
  const hasPromptCard = !isUser && splitPrompt(message.content).some((s) => s.type === "prompt");

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed break-words"
          style={{
            backgroundColor: isUser ? token.colorPrimary : token.colorBgContainer,
            color: isUser ? "#fff" : token.colorTextBase,
            border: isUser ? "none" : `1px solid ${token.colorBorder}`,
            borderBottomRightRadius: isUser ? "4px" : "16px",
            borderBottomLeftRadius: isUser ? "16px" : "4px",
            opacity: message.error ? 0.6 : 1,
          }}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <MessageContent content={message.content} onUse={onAppendMessage} />
          )}
        </div>

        {message.error && (
          <div className="flex items-center gap-2 px-1">
            <Typography.Text type="danger" style={{ fontSize: 12 }}>
              Not sent: {message.error}
            </Typography.Text>
            {onRetry && (
              <Button
                size="small"
                type="link"
                icon={<RotateCcw className="h-3 w-3" />}
                onClick={() => onRetry(message)}
                style={{ paddingInline: 0 }}
              >
                Try again
              </Button>
            )}
          </div>
        )}

        {!isUser && (
          <div className="flex items-center gap-2 px-1">
            {!hasPromptCard && onAppendMessage && (
              <Button
                size="small"
                type="text"
                icon={<Plus className="h-3 w-3" />}
                onClick={() => onAppendMessage(message.content)}
                style={{ color: token.colorPrimary, paddingInline: 4 }}
              >
                Use
              </Button>
            )}
            {message.truncated && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Answer cut short. Ask for the rest or send again.
              </Typography.Text>
            )}
            {message.tokenUsage && (
              <TokenBadge
                totalTokens={message.tokenUsage.totalTokens}
                model={message.tokenUsage.model}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
