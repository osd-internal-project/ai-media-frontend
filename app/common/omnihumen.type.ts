export type TOmnihumenTask = {
  id: number;
  uuid?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  taskRequestId?: string;
  taskMessage?: string;
  fileId?: string;
  filePath?: string;
  projectId: string;
  userId?: string;
  avatarName?: string;
  prompt?: string;
};
