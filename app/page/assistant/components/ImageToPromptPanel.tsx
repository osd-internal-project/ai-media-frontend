"use client";
import { useCallback, useState } from "react";
import { 
  Button, 
  Input, 
  Upload, 
  message as antMessage, 
  Typography, 
  theme, 
  Divider,
  Collapse,
  Tag
} from "antd";
import { 
  Inbox, 
  Image as ImageIcon, 
  Copy, 
  CheckCircle2, 
  Wand2,
  MessageSquarePlus,
  Info
} from "lucide-react";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import { axiosChatAssistant } from "@/app/lib/axios/axios";
import ChatAssistantService from "@/app/services/chat-assistant.service";
import type { ImagePromptResponse } from "@/app/services/chat-assistant.types";
import TokenBadge from "./TokenBadge";

const { Text, Title, Paragraph } = Typography;
const { Dragger } = Upload;

interface ImageToPromptPanelProps {
  userId: string;
  organizationId: string;
  onContinueChat: (conversationId: string) => void;
}

const ImageToPromptPanel = ({ userId, organizationId, onContinueChat }: ImageToPromptPanelProps) => {
  const { token } = theme.useToken();
  const service = ChatAssistantService(axiosChatAssistant);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImagePromptResponse | null>(null);
  
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  // ── Handle Upload ──────────────────────────────────────────
  const beforeUpload = (file: RcFile) => {
    const isAccepted = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
    if (!isAccepted) {
      antMessage.error("รองรับเฉพาะไฟล์ jpeg, png, webp, gif เท่านั้น");
      return Upload.LIST_IGNORE;
    }
    const isLt10M = file.size / 1024 / 1024 <= 10;
    if (!isLt10M) {
      antMessage.error("ขนาดไฟล์ต้องไม่เกิน 10MB");
      return Upload.LIST_IGNORE;
    }
    
    setFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setResult(null); // Reset result on new upload
    return false; // Prevent auto upload
  };

  const onRemove = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
  };

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false,
    beforeUpload,
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!file) {
      antMessage.error("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await service.generatePromptFromImage(file, {
        userId,
        organizationId,
        context: context.trim() || undefined,
        style: style.trim() || undefined,
      });
      setResult(response);
      antMessage.success("วิเคราะห์รูปภาพสำเร็จ!");
    } catch (error: any) {
      antMessage.error(error.message || "เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ");
    } finally {
      setLoading(false);
    }
  };

  // ── Copy Helpers ─────────────────────────────────────────
  const handleCopy = useCallback((text: string, type: 'prompt' | 'negative') => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedNegative(true);
      setTimeout(() => setCopiedNegative(false), 2000);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-8 hide-scrollbar">
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-normal tracking-tight" style={{ color: token.colorTextBase }}>
            Image to Prompt
          </h1>
          <p style={{ color: token.colorTextSecondary }}>
            อัปโหลดรูปภาพเพื่อวิเคราะห์และสร้าง Prompt สำหรับ AI 
          </p>
        </div>

        <div 
          className="rounded-2xl border p-6 shadow-sm"
          style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}
        >
          {/* Upload Zone */}
          {!previewUrl ? (
            <Dragger {...uploadProps} className="overflow-hidden rounded-xl border-dashed">
              <p className="ant-upload-drag-icon pt-4 text-center">
                <Inbox className="mx-auto h-12 w-12" style={{ color: token.colorPrimary }} />
              </p>
              <p className="ant-upload-text font-medium mt-2">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint px-4 pb-4 mt-1" style={{ color: token.colorTextTertiary }}>
                Support for a single image upload (JPEG, PNG, WEBP, GIF). Max size 10MB.
              </p>
            </Dragger>
          ) : (
            <div className="relative rounded-xl overflow-hidden border bg-black/5" style={{ borderColor: token.colorBorder }}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-auto max-h-[300px] object-contain"
              />
              <Button 
                danger 
                type="primary" 
                size="small" 
                className="absolute top-2 right-2 shadow-md"
                onClick={onRemove}
              >
                Remove
              </Button>
            </div>
          )}

          {/* Form Inputs */}
          <div className="mt-6 space-y-4">
            <div>
              <Text className="block mb-1.5 font-medium">Context (Optional)</Text>
              <Input.TextArea 
                placeholder="บอก AI ว่าจะใช้รูปนี้ทำอะไร เช่น โฆษณา Facebook แนว minimalist"
                rows={2}
                value={context}
                onChange={e => setContext(e.target.value)}
              />
            </div>
            
            <div>
              <Text className="block mb-1.5 font-medium">Style (Optional)</Text>
              <Input 
                placeholder="เช่น Cinematic, Hyperrealistic, 4K, Watercolor"
                value={style}
                onChange={e => setStyle(e.target.value)}
              />
            </div>

            <Button 
              type="primary" 
              size="large" 
              block 
              icon={<Wand2 className="h-4 w-4" />}
              loading={loading}
              onClick={handleSubmit}
              disabled={!file}
              className="mt-4"
              style={{ borderRadius: '0.75rem' }}
            >
              {loading ? "กำลังวิเคราะห์รูป..." : "สร้าง Prompt"}
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <Divider>
              <Text type="secondary" className="text-xs uppercase tracking-wider font-semibold">Results</Text>
            </Divider>

            <div 
              className="rounded-2xl border p-6 shadow-sm space-y-6"
              style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}
            >
              {/* Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-semibold flex items-center gap-2 text-base">
                    <ImageIcon className="h-4 w-4" /> Generated Prompt
                  </Text>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={copiedPrompt ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    onClick={() => handleCopy(result.prompt, 'prompt')}
                  >
                    {copiedPrompt ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div 
                  className="rounded-xl p-4 text-sm whitespace-pre-wrap font-mono"
                  style={{ backgroundColor: token.colorFillAlter, border: `1px solid ${token.colorBorder}` }}
                >
                  {result.prompt}
                </div>
              </div>

              {/* Negative Prompt */}
              {result.negativePrompt && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Text className="font-semibold flex items-center gap-2 text-base text-red-500">
                      <span className="text-lg leading-none mt-[-2px]">🚫</span> Negative Prompt
                    </Text>
                    <Button 
                      type="text" 
                      size="small" 
                      icon={copiedNegative ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      onClick={() => handleCopy(result.negativePrompt, 'negative')}
                    >
                      {copiedNegative ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div 
                    className="rounded-xl p-4 text-sm whitespace-pre-wrap font-mono relative overflow-hidden"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: `1px solid rgba(239, 68, 68, 0.2)` }}
                  >
                    {result.negativePrompt}
                  </div>
                </div>
              )}

              {/* Aspect Ratio */}
              {result.aspectRatio && (
                <div>
                  <Text className="font-medium mr-2">Aspect Ratio:</Text>
                  <Tag color="processing" className="text-sm px-3 py-1 rounded-md">{result.aspectRatio}</Tag>
                </div>
              )}

              {/* Breakdown Accordion */}
              {result.breakdown && Object.keys(result.breakdown).length > 0 && (
                <Collapse 
                  ghost 
                  className="bg-black/5 rounded-xl border mt-4" 
                  style={{ borderColor: token.colorBorder }}
                  items={[
                    {
                      key: '1',
                      label: <span className="font-medium flex items-center gap-2"><Info className="h-4 w-4" /> Image Analysis Details</span>,
                      children: (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4 px-2 pb-2 text-sm">
                          {Object.entries(result.breakdown).map(([key, value]) => {
                            if (!value) return null;
                            const label = key.replace(/([A-Z])/g, ' $1').trim();
                            return (
                              <div key={key}>
                                <Text type="secondary" className="block text-xs uppercase capitalize">{label}</Text>
                                <Text>{value}</Text>
                              </div>
                            );
                          })}
                        </div>
                      )
                    }
                  ]}
                />
              )}

              {/* Token Usage & Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4" style={{ borderColor: token.colorBorder }}>
                <TokenBadge totalTokens={result.tokenUsage.totalTokens} model={result.tokenUsage.model} />
                
                {result.conversationId && (
                  <Button 
                    type="primary" 
                    icon={<MessageSquarePlus className="h-4 w-4" />}
                    onClick={() => onContinueChat(result.conversationId!)}
                  >
                    ต่อ Chat
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageToPromptPanel;
