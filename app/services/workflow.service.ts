import { AxiosInstance } from "axios";

/** สถานะของบล็อกใน workflow */
export type WorkflowBlockStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed";

/** ชนิดงาน generate ของบล็อก */
export type WorkflowBlockType = "image" | "video";

/** หนึ่งบล็อก = หนึ่งงาน generate บนแคนวาส */
export interface WorkflowBlock {
  id: string;
  workflowConversationId: string;
  parentBlockIds: string[];
  type: WorkflowBlockType;
  status: WorkflowBlockStatus;
  prompt: string;
  model: string;
  resolution: string;
  generateConfig?: Record<string, unknown> | null;
  taskId?: string | null;
  outputUrl?: string | null;
  errorMessage?: string | null;
  positionX: number;
  positionY: number;
  duration?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** รายการ conversation (แคนวาส workflow) */
export interface WorkflowConversation {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  /** จำนวนบล็อก (มาจาก _count ฝั่ง backend) */
  _count?: { blocks: number };
  blocks?: WorkflowBlock[];
}

/** body สำหรับสร้าง conversation */
export interface CreateConversationPayload {
  name: string;
  description?: string;
}

/** body สำหรับสร้างบล็อก */
export interface CreateBlockPayload {
  type: WorkflowBlockType;
  prompt: string;
  model: string;
  resolution: string;
  parentBlockIds?: string[];
  positionX: number;
  positionY: number;
  /** payload เต็มแบบเดียวกับฟอร์ม Gen Image/Video เดิม (ส่งต่อให้ pipeline เดิม) */
  generateConfig: Record<string, unknown>;
}

/**
 * Service สำหรับเรียก REST endpoints ของฟีเจอร์ Workflow
 * รับ axios instance (axiosCore) ตามแพทเทิร์น service อื่นในโปรเจกต์
 * หมายเหตุ: endpoint ฝั่ง backend รับ body ตรง ๆ (ไม่ห่อด้วย { body })
 */
const WorkflowServices = (axiosInstance: AxiosInstance) => {
  return {
    /** ดึงรายการ conversation ทั้งหมดของโปรเจกต์ */
    listConversations: async (
      projectId: string,
    ): Promise<WorkflowConversation[]> => {
      const res = await axiosInstance.get(
        `/projects/${projectId}/workflow-conversations`,
      );
      return res.data;
    },

    /** สร้าง conversation ใหม่ */
    createConversation: async (
      projectId: string,
      payload: CreateConversationPayload,
    ): Promise<WorkflowConversation> => {
      const res = await axiosInstance.post(
        `/projects/${projectId}/workflow-conversations`,
        payload,
      );
      return res.data;
    },

    /** ดึง conversation พร้อมบล็อกทั้งหมด */
    getConversation: async (
      projectId: string,
      id: string,
    ): Promise<WorkflowConversation> => {
      const res = await axiosInstance.get(
        `/projects/${projectId}/workflow-conversations/${id}`,
      );
      return res.data;
    },

    /** ลบ conversation (บล็อกลูกถูกลบตาม) */
    deleteConversation: async (
      projectId: string,
      id: string,
    ): Promise<{ success: boolean }> => {
      const res = await axiosInstance.delete(
        `/projects/${projectId}/workflow-conversations/${id}`,
      );
      return res.data;
    },

    /** สร้างบล็อกใหม่และ enqueue งานทันที */
    createBlock: async (
      conversationId: string,
      payload: CreateBlockPayload,
    ): Promise<WorkflowBlock> => {
      const res = await axiosInstance.post(
        `/workflow-conversations/${conversationId}/blocks`,
        payload,
      );
      return res.data;
    },

    /** อัปเดตตำแหน่งบล็อกบนแคนวาส */
    updateBlockPosition: async (
      blockId: string,
      positionX: number,
      positionY: number,
    ): Promise<WorkflowBlock> => {
      const res = await axiosInstance.patch(
        `/workflow-blocks/${blockId}/position`,
        { positionX, positionY },
      );
      return res.data;
    },

    /** ลบบล็อก */
    deleteBlock: async (blockId: string): Promise<{ success: boolean }> => {
      const res = await axiosInstance.delete(`/workflow-blocks/${blockId}`);
      return res.data;
    },

    /** สั่งรันบล็อกซ้ำ (เฉพาะ failed|success) */
    retryBlock: async (blockId: string): Promise<WorkflowBlock> => {
      const res = await axiosInstance.post(
        `/workflow-blocks/${blockId}/retry`,
        {},
      );
      return res.data;
    },
  };
};

export default WorkflowServices;
