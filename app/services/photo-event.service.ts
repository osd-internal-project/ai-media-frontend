import axios, { AxiosInstance } from "axios";
import type {
  IPhotoEventTemplateInput,
  IPhotoEventGeneration,
  IPhotoEventPhoto,
  IPhotoEventTemplate,
  IPhotoEventPrintAsset,
  IPhotoEventPrintTemplate,
  IPrintLayout,
  IPublicPhotoEvent,
} from "../common/photo-event.type";

/** ดึงข้อความ error จาก NestJS response เพื่อแสดงบนหน้าจอ */
export const getPhotoEventErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return error.message;
  }
  return error instanceof Error ? error.message : "Unknown error";
};

/** read คืนค่าว่างเมื่อพลาดแบบ service อื่น ส่วน write จะ throw ให้หน้าจอแสดงสาเหตุ */
const PhotoEventService = (axiosInstance: AxiosInstance) => {
  const baseUrl = (projectId: string) => `/projects/${projectId}/photo-event`;
  return {
    findTemplates: async (projectId: string): Promise<IPhotoEventTemplate[]> => {
      return await axiosInstance
        .get(`${baseUrl(projectId)}/templates`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    findDefaultPromptTail: async (projectId: string): Promise<string> => {
      return await axiosInstance
        .get(`${baseUrl(projectId)}/templates/default-prompt-tail`)
        .then((res) => res.data?.promptTail ?? "")
        .catch((err) => {
          console.log(err);
          return "";
        });
    },
    setTemplates: async (
      projectId: string,
      userId: string,
      templates: IPhotoEventTemplateInput[],
    ): Promise<IPhotoEventTemplate[]> => {
      const res = await axiosInstance.put(`${baseUrl(projectId)}/templates`, {
        userId,
        templates,
      });
      return res.data;
    },
    findPhotos: async (projectId: string): Promise<IPhotoEventPhoto[]> => {
      return await axiosInstance
        .get(`${baseUrl(projectId)}/photos`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return [];
        });
    },
    uploadPhotos: async (
      projectId: string,
      userId: string,
      files: File[],
      onProgress?: (percent: number) => void,
    ): Promise<IPhotoEventPhoto[]> => {
      const formData = new FormData();
      formData.append("userId", userId);
      files.forEach((file) => formData.append("files", file));
      const res = await axiosInstance.post(`${baseUrl(projectId)}/photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      return res.data;
    },
    removePhoto: async (projectId: string, photoId: string, userId: string) => {
      const res = await axiosInstance.delete(
        `${baseUrl(projectId)}/photos/${photoId}`,
        { params: { userId } },
      );
      return res.data;
    },
    createGeneration: async (
      projectId: string,
      body: { userId: string; photoId: string; promptGuideId: number },
    ): Promise<IPhotoEventGeneration> => {
      const res = await axiosInstance.post(`${baseUrl(projectId)}/generations`, body);
      return res.data;
    },
    findGeneration: async (
      projectId: string,
      generationId: string,
    ): Promise<IPhotoEventGeneration | undefined> => {
      return await axiosInstance
        .get(`${baseUrl(projectId)}/generations/${generationId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return undefined;
        });
    },
    findPublic: async (
      generationId: string,
    ): Promise<IPublicPhotoEvent | undefined> => {
      return await axiosInstance
        .get(`/public/photo-event/${generationId}`)
        .then((res) => res.data)
        .catch((err) => {
          console.log(err);
          return undefined;
        });
    },
    // read ของ print template throw แทนคืนค่าว่าง — ว่างจริงแปลว่า "พิมพ์ด้วย layout default"
    // ถ้ากลืน error ไว้ kiosk จะพิมพ์ผิดแบบโดยไม่มีใครรู้
    findPrintTemplates: async (projectId: string): Promise<IPhotoEventPrintTemplate[]> => {
      const res = await axiosInstance.get(`${baseUrl(projectId)}/print-templates`);
      return res.data;
    },
    findActivePrintTemplate: async (
      projectId: string,
    ): Promise<IPhotoEventPrintTemplate | null> => {
      const res = await axiosInstance.get(`${baseUrl(projectId)}/print-templates/active`);
      return res.data || null;
    },
    createPrintTemplate: async (
      projectId: string,
      body: { userId: string; name: string; layout: IPrintLayout },
    ): Promise<IPhotoEventPrintTemplate> => {
      const res = await axiosInstance.post(`${baseUrl(projectId)}/print-templates`, body);
      return res.data;
    },
    updatePrintTemplate: async (
      projectId: string,
      templateId: string,
      body: { userId: string; name: string; layout: IPrintLayout },
    ): Promise<IPhotoEventPrintTemplate> => {
      const res = await axiosInstance.put(
        `${baseUrl(projectId)}/print-templates/${templateId}`,
        body,
      );
      return res.data;
    },
    activatePrintTemplate: async (
      projectId: string,
      templateId: string,
      userId: string,
    ): Promise<IPhotoEventPrintTemplate> => {
      const res = await axiosInstance.put(
        `${baseUrl(projectId)}/print-templates/${templateId}/activate`,
        { userId },
      );
      return res.data;
    },
    removePrintTemplate: async (projectId: string, templateId: string, userId: string) => {
      const res = await axiosInstance.delete(
        `${baseUrl(projectId)}/print-templates/${templateId}`,
        { params: { userId } },
      );
      return res.data;
    },
    uploadPrintAsset: async (
      projectId: string,
      userId: string,
      file: File,
    ): Promise<IPhotoEventPrintAsset> => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("file", file);
      const res = await axiosInstance.post(`${baseUrl(projectId)}/print-assets`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    publicDownloadUrl: (generationId: string) =>
      `${axiosInstance.defaults.baseURL ?? ""}/public/photo-event/${generationId}/download`,
  };
};

export default PhotoEventService;
