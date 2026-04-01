import { AxiosInstance } from "axios";
import type {
  ChatResponse,
  Conversation,
  CreateConversationPayload,
  GeneratePromptFromImageOptions,
  ImagePromptResponse,
  Message,
  SendChatPayload,
  TokenUsageSummary,
} from "./chat-assistant.types";

const ChatAssistantService = (axiosInstance: AxiosInstance) => {
  const base = "/conversations";

  return {
    /** POST /conversations */
    createConversation: async (
      payload: CreateConversationPayload
    ): Promise<Conversation | undefined> => {
      return axiosInstance
        .post(base, { title: "New Chat", ...payload })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] createConversation:", err);
          return undefined;
        });
    },

    /** GET /conversations?userId=xxx */
    listConversations: async (
      userId: string
    ): Promise<Conversation[]> => {
      return axiosInstance
        .get(base, { params: { userId } })
        .then((res) => res.data ?? [])
        .catch((err) => {
          console.error("[ChatAssistant] listConversations:", err);
          return [];
        });
    },

    /** GET /conversations/:id/messages?limit=50 */
    getMessages: async (
      conversationId: string,
      limit = 50
    ): Promise<Message[]> => {
      return axiosInstance
        .get(`${base}/${conversationId}/messages`, { params: { limit } })
        .then((res) => res.data ?? [])
        .catch((err) => {
          console.error("[ChatAssistant] getMessages:", err);
          return [];
        });
    },

    /** POST /chat  (non-streaming) */
    sendChat: async (
      payload: SendChatPayload
    ): Promise<ChatResponse | undefined> => {
      return axiosInstance
        .post("/chat", { ...payload, stream: false })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] sendChat:", err);
          return undefined;
        });
    },

    /** PATCH /conversations/:id */
    updateConversation: async (
      id: string,
      title: string
    ): Promise<Conversation | undefined> => {
      return axiosInstance
        .patch(`${base}/${id}`, { title })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] updateConversation:", err);
          return undefined;
        });
    },

    /** DELETE /conversations/:id */
    deleteConversation: async (id: string): Promise<boolean> => {
      return axiosInstance
        .delete(`${base}/${id}`)
        .then(() => true)
        .catch((err) => {
          console.error("[ChatAssistant] deleteConversation:", err);
          return false;
        });
    },

    /** GET /conversations/:id/token-usage */
    getTokenUsage: async (
      conversationId: string
    ): Promise<TokenUsageSummary | undefined> => {
      return axiosInstance
        .get(`${base}/${conversationId}/token-usage`)
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] getTokenUsage:", err);
          return undefined;
        });
    },

    /** POST /prompt/from-image */
    generatePromptFromImage: async (
      file: File,
      options?: GeneratePromptFromImageOptions
    ): Promise<ImagePromptResponse> => {
      const formData = new FormData();
      formData.append("file", file);
      if (options?.userId) formData.append("userId", options.userId);
      if (options?.conversationId)
        formData.append("conversationId", options.conversationId);
      if (options?.organizationId)
        formData.append("organizationId", options.organizationId);
      if (options?.context) formData.append("context", options.context);
      if (options?.style) formData.append("style", options.style);
      if (options?.model) formData.append("model", options.model);

      return axiosInstance
        .post("/prompt/from-image", formData, {
          headers: {
            // Let the browser set the content type with the correct boundary
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] generatePromptFromImage:", err);
          throw new Error(err.response?.data?.message ?? "Failed to generate prompt from image");
        });
    },
  };
};

export default ChatAssistantService;
