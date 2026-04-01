"use client";
import { useRef, useState } from "react";
import { Button, Input, theme, Typography } from "antd";
import { ArrowUp, LayoutTemplate, Settings } from "lucide-react";

const { Text } = Typography;

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput = ({ onSend, disabled, placeholder = "Message assistant..." }: ChatInputProps) => {
  const { token } = theme.useToken();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="shrink-0 p-4 border-t"
      style={{ borderColor: token.colorBorder, backgroundColor: token.colorBgBase }}
    >
      <div
        className="flex flex-col rounded-[1.5rem] border p-3 transition-colors duration-300 shadow-sm"
        style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}
      >
        <Input.TextArea
          ref={textareaRef as any}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          variant="borderless"
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={disabled}
          className="text-base w-full px-1"
          style={{ color: token.colorTextBase, resize: "none" }}
        />

        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1">
            <Button
              type="text"
              shape="round"
              size="small"
              icon={<LayoutTemplate className="h-4 w-4" style={{ color: token.colorTextSecondary }} />}
            >
              <Text style={{ color: token.colorTextSecondary, fontSize: 13 }}>Templates</Text>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="text"
              shape="circle"
              icon={<Settings className="h-4 w-4" style={{ color: token.colorTextSecondary }} />}
            />
            <Button
              type="primary"
              shape="circle"
              size="large"
              disabled={!text.trim() || disabled}
              onClick={handleSend}
              icon={<ArrowUp className="h-5 w-5" />}
              style={{
                backgroundColor: text.trim() && !disabled ? token.colorPrimary : token.colorFillAlter,
                color: text.trim() && !disabled ? "#fff" : token.colorTextSecondary,
                boxShadow: "none",
                border: "none",
              }}
            />
          </div>
        </div>
      </div>
      <p className="text-center mt-2 text-xs" style={{ color: token.colorTextQuaternary }}>
        Press <kbd className="rounded px-1 py-0.5 text-[11px]" style={{ border: `1px solid ${token.colorBorder}` }}>Enter</kbd> to send &middot; <kbd className="rounded px-1 py-0.5 text-[11px]" style={{ border: `1px solid ${token.colorBorder}` }}>Shift+Enter</kbd> for new line
      </p>
    </div>
  );
};

export default ChatInput;
