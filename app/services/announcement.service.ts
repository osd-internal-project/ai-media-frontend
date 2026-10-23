import { AxiosInstance } from "axios";
import {
  IAnnouncement,
  IAnnouncementInput,
} from "../common/announcement.type";

// axiosCore ตั้ง Content-Type เป็น JSON ไว้ — ต้องระบุ multipart เอง (แบบ photo-event.service)
const multipart = { headers: { "Content-Type": "multipart/form-data" } };

const toFormData = (input: IAnnouncementInput): FormData => {
  const form = new FormData();
  form.append("category", input.category);
  form.append("title", input.title);
  if (input.body) form.append("body", input.body);
  if (input.sortOrder !== undefined)
    form.append("sortOrder", String(input.sortOrder));
  if (input.isActive !== undefined)
    form.append("isActive", String(input.isActive));
  if (input.removeImage) form.append("removeImage", "true");
  if (input.file) form.append("file", input.file);
  return form;
};

/** ประกาศบนหน้า public (super admin) — ใช้กับ axiosCore; write จะ throw ให้หน้าจอแสดงสาเหตุ */
const AnnouncementService = (axiosInstance: AxiosInstance) => {
  const baseUrl = "/announcement";
  return {
    findAll: async (): Promise<IAnnouncement[]> => {
      return await axiosInstance.get(baseUrl).then((res) => res.data);
    },
    create: async (input: IAnnouncementInput): Promise<IAnnouncement> => {
      return await axiosInstance
        .post(baseUrl, toFormData(input), multipart)
        .then((res) => res.data);
    },
    update: async (
      id: string,
      input: IAnnouncementInput,
    ): Promise<IAnnouncement> => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}`, toFormData(input), multipart)
        .then((res) => res.data);
    },
    setActive: async (id: string, isActive: boolean): Promise<IAnnouncement> => {
      return await axiosInstance
        .patch(`${baseUrl}/${id}/active`, { isActive })
        .then((res) => res.data);
    },
    remove: async (id: string): Promise<void> => {
      await axiosInstance.delete(`${baseUrl}/${id}`);
    },
  };
};

export default AnnouncementService;
