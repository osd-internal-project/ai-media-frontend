// ============================================================
//  Chat Assistant – TypeScript Types
// ============================================================

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  model?: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt?: string;
  _count?: { messages: number };
}

export type MessageRole = "user" | "assistant" | "tool" | "system";

export interface Message {
  id: string;
  conversationId?: string;
  role: MessageRole;
  content: string;
  sequence?: number;
  createdAt: string;
  /** Populated on the frontend after a streaming `done` event */
  tokenUsage?: TokenUsage;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model?: string;
}

export interface ChatResponse {
  conversationId: string;
  messageId: string;
  content: string;
  role: "assistant";
  tokenUsage: TokenUsage;
  finishReason: string;
  createdAt: string;
}

export interface StreamChunk {
  type: "content" | "done" | "error";
  delta?: string;
  tokenUsage?: TokenUsage;
  conversationId?: string;
  messageId?: string;
  finishReason?: string;
  error?: string;
}

export interface TokenUsageSummary {
  conversationId: string;
  totalApiCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
}

export interface CreateConversationPayload {
  userId: string;
  title?: string;
  organizationId?: string;
}
export interface SetConversationPayload {
  userId: string;
  title?: string;
  projectId: string;
  organizationId?: string;
}

export interface SendChatPayload {
  userId: string;
  conversationId: string;
  message: string;
  stream?: boolean;
}

// ============================================================
//  Image → Prompt
// ============================================================

export interface ImagePromptBreakdown {
  subject?: string;
  action?: string;
  environment?: string;
  lighting?: string;
  cameraAngle?: string;
  style?: string;
  colorPalette?: string;
}

export interface ImagePromptResponse {
  analysis: string;
  breakdown: ImagePromptBreakdown;
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  tokenUsage: TokenUsage;
  conversationId?: string;
  messageId?: string;
}

export interface GeneratePromptFromImageOptions {
  userId?: string;
  conversationId?: string;
  organizationId?: string;
  context?: string;
  style?: string;
  model?: string;
}
