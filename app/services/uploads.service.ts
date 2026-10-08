import { AxiosInstance, isAxiosError } from "axios";

type DirectUploadKind = "ref" | "prompt-guide";

// axiosWorker ตั้ง default เป็น multipart/form-data — ถ้าไม่ override axios จะแปลง object เป็น
// FormData แล้ว endpoint ที่ไม่มี multer จะได้ body ว่าง
const JSON_HEADERS = { headers: { "Content-Type": "application/json" } };

interface PresignResponse {
  uid: string;
  imagePath: string;
  uploadUrl: string;
  expiresIn: number;
}

/** ข้อความ error ที่ user อ่านรู้เรื่อง — ใช้ `message` จาก backend ก่อนถ้ามี */
const toUploadError = (error: unknown): Error => {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    const text = Array.isArray(message) ? message.join(", ") : message;
    return new Error(
      text || `Upload failed (${error.response?.status ?? "network"})`,
    );
  }
  return error instanceof Error ? error : new Error(String(error));
};

/** อ่าน field ที่เป็น string จาก FormData (ค่าว่างเมื่อไม่มี) */
const field = (formData: FormData, name: string): string => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

/**
 * อัปโหลดไฟล์ตรงจาก browser เข้า TOS: presign → PUT → confirm
 * ไฟล์ไม่วิ่งผ่าน worker pod; คืน shape เดียวกับ endpoint multipart เดิม
 * @throws Error ที่มีข้อความจาก backend/TOS เมื่อขั้นใดล้ม (ไม่มี fallback)
 */
const uploadDirect = async (
  axiosInstance: AxiosInstance,
  kind: DirectUploadKind,
  formData: FormData,
) => {
  const file = formData.get("file");
  if (!(file instanceof Blob)) throw new Error("No file to upload");
  const fileName = file instanceof File ? file.name : "upload";
  console.log(`Direct upload ${kind} "${fileName}" (${file.size} bytes)`);
  const presign = await axiosInstance
    .post<PresignResponse>(
      "/upload/presign",
      {
        kind,
        userId: field(formData, "userId"),
        index: Number(field(formData, "index")) || 0,
        uid: field(formData, "uid"),
        organizationId: field(formData, "organizationId"),
        generateType: field(formData, "generateType"),
        projectId: field(formData, "projectId") || undefined,
        promptGuideId: field(formData, "promptGuideId") || undefined,
        fileName,
        contentType: file.type,
        size: file.size,
      },
      JSON_HEADERS,
    )
    .then((res) => res.data)
    .catch((error: unknown) => {
      throw toUploadError(error);
    });
  try {
    const put = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) throw new Error(`TOS upload failed (${put.status})`);
    const { data } = await axiosInstance.post(
      "/upload/confirm",
      { kind, uid: presign.uid },
      JSON_HEADERS,
    );
    return data;
  } catch (error) {
    // ปล่อย row ที่จองไว้ ให้ user อัปไฟล์เดิม (uid เดิม) ซ้ำได้
    const releasePath =
      kind === "ref"
        ? `/upload/delete/${presign.uid}`
        : `/upload/prompt-guide-image/delete/${presign.uid}`;
    await axiosInstance.delete(releasePath).catch((releaseError) => {
      console.warn("Cannot release reserved upload", releaseError);
    });
    throw toUploadError(error);
  }
};

const UploadsServices = (axiosInstance: AxiosInstance) => {
  return {
    upload: async (formData: any) => {
      return uploadDirect(axiosInstance, "ref", formData);
    },
    remove: async (uid: string) => {
      return await axiosInstance
        .delete(`/upload/delete/${uid}`)
        .then((result) => result.data)
        .catch((err) => err);
    },
    uploadFromPrompt: async (formData: any) => {
      return await axiosInstance
        .post(`/upload/from-prompt`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((result) => result.data)
        .catch((err) => err);
    },
    //Prompt guide Images
    uploadPromptGuideImage: async (formData: any) => {
      return uploadDirect(axiosInstance, "prompt-guide", formData);
    },
    removePromptGuideImage: async (uid: string) => {
      return await axiosInstance
        .delete(`/upload/prompt-guide-image/delete/${uid}`)
        .then((result) => result.data)
        .catch((err) => err);
    },
  };
};

export default UploadsServices;
