import { axiosCore } from "@/app/lib/axios/axios";
import GalleryServices from "@/app/services/gellory.service";

/** A finished generation from the project's All Activity list. */
export interface ActivityMedia {
  galleryId: string;
  name: string;
  media: "video" | "image";
  /** Presigned, expires after ~6h — never persist it, re-fetch by galleryId instead. */
  url: string;
  createdAt: string;
}

export interface ActivityPage {
  items: ActivityMedia[];
  /** Gallery rows on the server, unfinished ones included — used only for paging. */
  total: number;
}

const VIDEO_TYPES = new Set(["video", "dreamactor", "omnihumen", "omnihuman"]);

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

function toActivityMedia(row: unknown): ActivityMedia | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>; // narrowed above; fields are checked one by one
  const type = asString(record.typeGenerate)?.toLowerCase();
  const galleryId = asString(record.id);
  const url = asString(record.imageUrl);
  // Pending, failed and still-uploading rows have nothing to show yet.
  if (!type || !galleryId || !url || record.genneratedStatus !== "SUCCESS") return null;
  const media = VIDEO_TYPES.has(type) ? "video" : type === "image" ? "image" : null;
  if (!media) return null;

  const createdAt = asString(record.createdAt) ?? "";
  const prompt = asString(record.prompt);
  return {
    galleryId,
    url,
    media,
    createdAt,
    name: prompt ? prompt.slice(0, 40) : `${media === "video" ? "Video" : "Image"} ${createdAt.slice(0, 10)}`,
  };
}

/**
 * One page of the project's All Activity (every generation, saved to Library or not).
 * The gallery endpoint has no type/status filter, so a page can hold fewer items than `pageSize`.
 */
export async function fetchActivityMedia(
  projectId: string,
  organizationId: string,
  page: number,
  pageSize: number,
): Promise<ActivityPage> {
  const res: unknown = await GalleryServices(axiosCore).findById(projectId, organizationId, page, pageSize);
  // The service swallows errors and resolves undefined.
  if (typeof res !== "object" || res === null) throw new Error("activity request failed");
  const body = res as { data?: unknown; total?: unknown }; // shape checked field by field below
  const rows = Array.isArray(body.data) ? body.data : [];
  return {
    items: rows.map(toActivityMedia).filter((item): item is ActivityMedia => item !== null),
    total: typeof body.total === "number" ? body.total : rows.length,
  };
}

/** Fresh presigned URLs for gallery ids restored from a draft (stored URLs would have expired). */
export async function resolveLibraryUrls(
  projectId: string,
  organizationId: string,
  galleryIds: Set<string>,
): Promise<Map<string, string>> {
  const pageSize = 50;
  const urls = new Map<string, string>();
  for (let page = 1; urls.size < galleryIds.size; page++) {
    const { items, total } = await fetchActivityMedia(projectId, organizationId, page, pageSize);
    for (const item of items) {
      if (galleryIds.has(item.galleryId)) urls.set(item.galleryId, item.url);
    }
    if (page * pageSize >= total) break;
  }
  return urls;
}

/**
 * Downloads a whole file with a plain GET (no Range header), so it works with the
 * bucket's current CORS rules. Throws when the request is blocked or fails.
 */
export async function downloadAsFile(url: string, name: string, fallbackType: string): Promise<File> {
  // no-store: <video>/<img> cached this URL without CORS headers (bucket sends no `Vary: Origin`).
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`download failed (${res.status})`);
  const blob = await res.blob();
  return new File([blob], name, { type: blob.type || fallbackType });
}
