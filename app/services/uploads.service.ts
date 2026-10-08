import { AxiosInstance, isAxiosError } from "axios";
import config from "@/app/config";

type DirectUploadKind = "ref" | "prompt-guide";
type UploadMediaType = "image" | "video" | "audio";

// axiosWorker ตั้ง default เป็น multipart/form-data — ถ้าไม่ override axios จะแปลง object เป็น
// FormData แล้ว endpoint ที่ไม่มี multer จะได้ body ว่าง
const JSON_HEADERS = { headers: { "Content-Type": "application/json" } };

interface PresignResponse {
  uid: string;
  imagePath: string;
  uploadUrl: string;
  expiresIn: number;
}

interface UploadPolicy {
  url: string;
  fields: Record<string, string>;
  keyPrefix: string;
  expiresAt: string;
}

/** ผลลัพธ์จาก worker ที่ TOS ส่งต่อมาใน response ของ form POST */
export interface UploadedFile {
  uid: string;
  name: string;
  url: string;
  imagePath: string;
  status: string;
}

/** ใช้ policy ซ้ำจนเหลืออายุไม่ถึงค่านี้ — ไม่ต้องขอทุกไฟล์ */
const POLICY_REFRESH_BEFORE_MS = 2 * 60 * 1000;
const policyCache = new Map<string, UploadPolicy>();

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

const mediaTypeOf = (contentType: string): UploadMediaType => {
  const major = contentType.split("/")[0];
  if (major === "image" || major === "video" || major === "audio") return major;
  throw new Error(`Unsupported file type: ${contentType || "unknown"}`);
};

const getPolicy = async (
  axiosInstance: AxiosInstance,
  params: Record<string, string | undefined>,
): Promise<UploadPolicy> => {
  const cacheKey = JSON.stringify(params);
  const cached = policyCache.get(cacheKey);
  if (
    cached &&
    new Date(cached.expiresAt).getTime() - Date.now() > POLICY_REFRESH_BEFORE_MS
  ) {
    return cached;
  }
  const policy = await axiosInstance
    .get<UploadPolicy>("/upload/policy", { params })
    .then((res) => res.data)
    .catch((error: unknown) => {
      throw toUploadError(error);
    });
  policyCache.set(cacheKey, policy);
  return policy;
};

/** อ่าน Code/Message จาก error ของ TOS (XML หรือ JSON) */
const tosErrorMessage = async (res: Response): Promise<string> => {
  const text = await res.text();
  const code = /"?Code"?\s*[:>]\s*"?([A-Za-z]+)/.exec(text)?.[1];
  const message = /"?Message"?\s*[:>]\s*"?([^"<]+)/.exec(text)?.[1];
  return `TOS upload failed (${res.status}${code ? ` ${code}` : ""})${
    message ? `: ${message}` : ""
  }`;
};

/**
 * อัปโหลดไฟล์ตรงจาก browser เข้า TOS ด้วย PostObject policy + upload callback
 * request เดียวต่อไฟล์: TOS เก็บไฟล์ → เรียก worker สร้าง row → ส่งผลลัพธ์กลับมาใน response นี้
 * @throws Error ที่มีข้อความจาก backend/TOS เมื่อขั้นใดล้ม (ไม่มี fallback)
 */
const uploadViaPolicy = async (
  axiosInstance: AxiosInstance,
  kind: DirectUploadKind,
  formData: FormData,
): Promise<UploadedFile> => {
  const file = formData.get("file");
  if (!(file instanceof Blob)) throw new Error("No file to upload");
  const fileName = file instanceof File ? file.name : "upload";
  const uid = field(formData, "uid");
  if (!uid) throw new Error("Upload uid is missing");
  const policy = await getPolicy(axiosInstance, {
    kind,
    organizationId: field(formData, "organizationId"),
    userId: field(formData, "userId"),
    projectId: field(formData, "projectId") || undefined,
    promptGuideId: field(formData, "promptGuideId") || undefined,
    mediaType: mediaTypeOf(file.type),
  });

  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : "";
  const form = new FormData();
  Object.entries(policy.fields).forEach(([name, value]) =>
    form.append(name, value),
  );
  form.append("key", `${policy.keyPrefix}${uid}${ext}`);
  form.append("Content-Type", file.type);
  form.append(
    "x-tos-callback-var",
    // ชื่อไฟล์ encode ก่อน — อักขระพิเศษจะได้ไม่ทำ JSON ของ callback พัง (และ btoa รับแค่ ASCII)
    btoa(
      JSON.stringify({
        "x:uid": uid,
        "x:name": encodeURIComponent(fileName),
        "x:index": String(Number(field(formData, "index")) || 0),
        "x:generateType": field(formData, "generateType") || "image",
      }),
    ),
  );
  form.append("file", file); // TOS ต้องการให้ file เป็น field สุดท้าย

  const res = await fetch(policy.url, { method: "POST", body: form });
  // 203 = TOS เก็บไฟล์แล้วแต่ callback ไป worker ไม่สำเร็จ — ไม่มี row จึงถือว่าล้ม
  if (res.status !== 200) throw new Error(await tosErrorMessage(res));
  const data = (await res.json()) as Partial<UploadedFile>;
  if (!data.imagePath || !data.url) {
    throw new Error("Upload callback returned no imagePath");
  }
  return {
    uid: data.uid ?? uid,
    name: data.name ?? fileName,
    url: data.url,
    imagePath: data.imagePath,
    status: data.status ?? "waiting",
  };
};

/**
 * โหมด presign (env ที่ TOS เรียก callback ไม่ถึง): presign → PUT เข้า TOS → confirm
 * @throws Error ที่มีข้อความจาก backend/TOS เมื่อขั้นใดล้ม (ไม่มี fallback)
 */
const uploadViaPresign = async (
  axiosInstance: AxiosInstance,
  kind: DirectUploadKind,
  formData: FormData,
): Promise<UploadedFile> => {
  const file = formData.get("file");
  if (!(file instanceof Blob)) throw new Error("No file to upload");
  const fileName = file instanceof File ? file.name : "upload";
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
  let data: Partial<UploadedFile>;
  try {
    const put = await fetch(presign.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) throw new Error(`TOS upload failed (${put.status})`);
    const res = await axiosInstance.post<Partial<UploadedFile>>(
      "/upload/confirm",
      { kind, uid: presign.uid },
      JSON_HEADERS,
    );
    data = res.data;
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
  if (!data.imagePath || !data.url) {
    throw new Error("Upload confirm returned no imagePath");
  }
  return {
    uid: data.uid ?? presign.uid,
    name: data.name ?? fileName,
    url: data.url,
    imagePath: data.imagePath,
    status: data.status ?? "waiting",
  };
};

/** เลือกโหมดตาม `NEXT_PUBLIC_UPLOAD_MODE` ของ env นั้น — ไม่สลับโหมดเองเมื่อล้ม */
const uploadDirect = (
  axiosInstance: AxiosInstance,
  kind: DirectUploadKind,
  formData: FormData,
): Promise<UploadedFile> => {
  const file = formData.get("file");
  console.log(
    `Direct upload (${config.uploadMode}) ${kind} "${
      file instanceof File ? file.name : "upload"
    }" (${file instanceof Blob ? file.size : 0} bytes)`,
  );
  return config.uploadMode === "presign"
    ? uploadViaPresign(axiosInstance, kind, formData)
    : uploadViaPolicy(axiosInstance, kind, formData);
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
