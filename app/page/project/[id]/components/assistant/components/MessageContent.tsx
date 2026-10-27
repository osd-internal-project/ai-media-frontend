"use client";
import { Fragment, type ReactNode } from "react";
import { Button, theme, message as antMessage } from "antd";
import { Copy, Plus } from "lucide-react";

type Segment = { type: "text" | "prompt"; text: string };

/**
 * แยกคำตอบเป็นข้อความกับ prompt — prompt คือเนื้อหาใน ``` (ดู SHARED_RULES ฝั่ง backend)
 * fence ที่ยังไม่ปิด (ระหว่าง stream) นับเป็น prompt ไปก่อน การ์ดจึงไม่กระโดดตอนจบ
 */
export function splitPrompt(content: string): Segment[] {
  return content
    .split("```")
    .map((part, i): Segment => {
      if (i % 2 === 0) return { type: "text", text: part.trim() };
      // บรรทัดแรกหลัง ``` อาจเป็นชื่อภาษา เช่น ```text
      return { type: "prompt", text: part.replace(/^[a-zA-Z-]*\n/, "").trim() };
    })
    .filter((segment) => segment.text);
}

/** ตัวหนาจาก **x** — คำตอบเก่ายังเป็น markdown */
function renderInline(line: string): ReactNode[] {
  return line.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      {text.split("\n").map((line, i) => {
        const heading = line.match(/^#{1,6}\s+(.*)$/);
        return (
          <Fragment key={i}>
            {i > 0 && "\n"}
            {heading ? <strong>{renderInline(heading[1])}</strong> : renderInline(line)}
          </Fragment>
        );
      })}
    </div>
  );
}

function PromptCard({ text, onUse }: { text: string; onUse?: (text: string) => void }) {
  const { token } = theme.useToken();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      antMessage.success("Prompt copied");
    } catch {
      antMessage.error("Couldn't copy. Select the text and copy it instead.");
    }
  };

  return (
    <div
      className="rounded-[10px] border"
      style={{ backgroundColor: token.colorFillAlter, borderColor: token.colorBorder }}
    >
      <div
        className="whitespace-pre-wrap break-words px-3 pt-3 pb-2"
        style={{ fontSize: 13, lineHeight: 1.6, color: token.colorTextBase }}
      >
        {text}
      </div>
      {onUse && (
        <div className="flex justify-end gap-1 px-2 pb-2">
          <Button size="small" type="text" icon={<Copy className="h-3.5 w-3.5" />} onClick={copy}>
            Copy
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => onUse(text)}
          >
            Use
          </Button>
        </div>
      )}
    </div>
  );
}

interface MessageContentProps {
  content: string;
  /** ไม่ส่ง = ซ่อนปุ่ม (ระหว่าง stream) */
  onUse?: (text: string) => void;
}

/** คำตอบของผู้ช่วย: ข้อความธรรมดา + prompt card ที่กด Use ได้ */
const MessageContent = ({ content, onUse }: MessageContentProps) => (
  <div className="flex flex-col gap-3">
    {splitPrompt(content).map((segment, i) =>
      segment.type === "prompt" ? (
        <PromptCard key={i} text={segment.text} onUse={onUse} />
      ) : (
        <TextBlock key={i} text={segment.text} />
      ),
    )}
  </div>
);

export default MessageContent;
