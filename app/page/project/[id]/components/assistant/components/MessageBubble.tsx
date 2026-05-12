"use client";
import { theme, Typography, Tooltip } from "antd";
import { ChevronDown, ChevronUp, Wrench, Plus } from "lucide-react";
import { useRef, useState, useLayoutEffect } from "react";
import type { Message } from "@/app/services/chat-assistant.types";
import TokenBadge from "./TokenBadge";

const COLLAPSED_LINE_HEIGHT = 20; // px per line (text-sm leading-relaxed ≈ 1.625 * 13px)
const MAX_COLLAPSED_LINES = 3;
const COLLAPSED_MAX_HEIGHT = COLLAPSED_LINE_HEIGHT * MAX_COLLAPSED_LINES;

interface MessageBubbleProps {
  message: Message;
  onAppendMessage?: (content: string) => void;
}

const MessageBubble = ({ message, onAppendMessage }: MessageBubbleProps) => {
  const { token } = theme.useToken();
  const [toolExpanded, setToolExpanded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setOverflows(el.scrollHeight > COLLAPSED_MAX_HEIGHT + 4);
  }, [message.content]);

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

  const isUser = message.role === "user";

  return (
    <div className={`flex mb-4 group ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className="relative">
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
            <div
              ref={contentRef}
              style={{
                overflow: "hidden",
                maxHeight: expanded ? "none" : `${COLLAPSED_MAX_HEIGHT}px`,
                transition: "max-height 0.25s ease",
              }}
            >
              {message.content}
            </div>

            {overflows && (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="flex items-center gap-1 mt-2 text-xs font-medium transition-opacity opacity-70 hover:opacity-100"
                style={{ color: isUser ? "rgba(255,255,255,0.85)" : token.colorPrimary, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                {expanded ? (
                  <><ChevronUp className="h-3 w-3" /> Show less</>
                ) : (
                  <><ChevronDown className="h-3 w-3" /> Show more</>
                )}
              </button>
            )}
          </div>

          {!isUser && onAppendMessage && (
            <Tooltip title="Add to prompt draft">
              <button
                onClick={() => onAppendMessage(message.content)}
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-0.5"
                style={{
                  backgroundColor: token.colorPrimary,
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "2px 6px",
                  fontSize: 10,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  lineHeight: "16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                }}
              >
                <Plus className="h-2.5 w-2.5" />
                Use
              </button>
            </Tooltip>
          )}
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
