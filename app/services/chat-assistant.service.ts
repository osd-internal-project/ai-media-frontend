import { AxiosInstance } from "axios";
import type {
  ChatAssistantSetting,
  ChatModelOption,
  ChatResponse,
  Conversation,
  CreateConversationPayload,
  GeneratePromptFromImageOptions,
  ImagePromptResponse,
  Message,
  SendChatPayload,
  SetConversationPayload,
} from "./chat-assistant.types";

/**
 * client ของ service chat-assistant
 *
 * หมายเหตุเรื่องสิทธิ์: ทุก endpoint ที่แตะบทสนทนาใบเดียวต้องส่ง `userId` ไปด้วย
 * เพราะ backend ตรวจความเป็นเจ้าของก่อนคืนหรือแก้ข้อมูล (เดิมค้นด้วย id อย่างเดียว
 * ใครรู้ id ของคนอื่นก็เปิดอ่านได้)
 */
const ChatAssistantService = (axiosInstance: AxiosInstance) => {
  const base = "/conversations";

  return {
    /** GET /chat-models — โมเดลที่ผู้ใช้เลือกได้ */
    listChatModels: async (): Promise<ChatModelOption[]> => {
      return axiosInstance
        .get("/chat-models")
        .then((res) => res.data ?? [])
        .catch((err) => {
          console.error("[ChatAssistant] listChatModels:", err);
          return [];
        });
    },

    /** GET /chat-assistant-setting — throw ต่อ ผู้เรียกตัดสินเองว่าโหลดไม่ได้ = ปิด */
    getSetting: async (): Promise<ChatAssistantSetting> => {
      return axiosInstance.get("/chat-assistant-setting").then((res) => res.data);
    },

    /** PATCH /chat-assistant-setting — super admin เท่านั้น */
    setSetting: async (enabled: boolean): Promise<ChatAssistantSetting> => {
      return axiosInstance
        .patch("/chat-assistant-setting", { enabled })
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(
            err.response?.data?.message ?? "Failed to change the chat assistant setting",
          );
        });
    },

    /** POST /conversations */
    createConversation: async (
      payload: CreateConversationPayload,
    ): Promise<Conversation | undefined> => {
      return axiosInstance
        .post(base, { title: "New Chat", ...payload })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] createConversation:", err);
          return undefined;
        });
    },

    setConversation: async (
      payload: SetConversationPayload,
    ): Promise<Conversation | undefined> => {
      return axiosInstance
        .post(`${base}/set`, { ...payload })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] setConversation:", err);
          return undefined;
        });
    },

    /** GET /conversations?userId=xxx */
    listConversations: async (userId: string): Promise<Conversation[]> => {
      return axiosInstance
        .get(base, { params: { userId } })
        .then((res) => res.data ?? [])
        .catch((err) => {
          console.error("[ChatAssistant] listConversations:", err);
          return [];
        });
    },

    /** GET /conversations/:id/messages?userId=xxx&limit=50 */
    getMessages: async (
      conversationId: string,
      userId: string,
      limit = 50,
    ): Promise<Message[]> => {
      return axiosInstance
        .get(`${base}/${conversationId}/messages`, {
          params: { userId, limit },
        })
        .then((res) => res.data ?? [])
        .catch((err) => {
          console.error("[ChatAssistant] getMessages:", err);
          return [];
        });
    },

    /**
     * POST /chat — ตอบแบบรอจนจบ
     *
     * error ถูก throw ต่อ ไม่ swallow เหมือนเมธอดอื่นในไฟล์นี้ เพราะการส่งข้อความ
     * แล้วไม่ได้คำตอบต้องบอกผู้ใช้ให้รู้ ไม่ใช่เงียบไปเฉย ๆ
     */
    sendChat: async (payload: SendChatPayload): Promise<ChatResponse> => {
      return axiosInstance
        .post("/chat", payload)
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] sendChat:", err);
          throw new Error(
            err.response?.data?.message ?? "Failed to send the message",
          );
        });
    },

    /** PATCH /conversations/:id */
    updateConversation: async (
      id: string,
      userId: string,
      title: string,
    ): Promise<Conversation | undefined> => {
      return axiosInstance
        .patch(`${base}/${id}`, { userId, title })
        .then((res) => res.data)
        .catch((err) => {
          console.error("[ChatAssistant] updateConversation:", err);
          return undefined;
        });
    },

    /** DELETE /conversations/:id?userId=xxx */
    deleteConversation: async (
      id: string,
      userId: string,
    ): Promise<boolean> => {
      return axiosInstance
        .delete(`${base}/${id}`, { params: { userId } })
        .then(() => true)
        .catch((err) => {
          console.error("[ChatAssistant] deleteConversation:", err);
          return false;
        });
    },

    /** POST /prompt/from-image */
    generatePromptFromImage: async (
      file: File,
      options?: GeneratePromptFromImageOptions,
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
          throw new Error(
            err.response?.data?.message ??
              "Failed to generate prompt from image",
          );
        });
    },
  };
};

export default ChatAssistantService;
