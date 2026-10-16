import type { EditorProject } from "../model/types";

const DB_NAME = "ai-media-video-editor";
const DB_VERSION = 1;
const DRAFTS = "drafts";
const FILES = "files";

interface StoredFile {
  fileKey: string;
  projectId: string;
  file: File;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        db.createObjectStore(DRAFTS, { keyPath: "projectId" });
        db.createObjectStore(FILES, { keyPath: "fileKey" }).createIndex("projectId", "projectId");
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

function done<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function store(name: string, mode: IDBTransactionMode) {
  return (await openDb()).transaction(name, mode).objectStore(name);
}

function isEditorProject(value: unknown): value is EditorProject {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>; // narrowed above; only the fields the editor relies on are checked
  return typeof record.projectId === "string" && Array.isArray(record.layers) && typeof record.aspect === "string";
}

/** One draft per project on this device. */
export async function saveDraft(project: EditorProject): Promise<void> {
  await done((await store(DRAFTS, "readwrite")).put(project));
}

export async function loadDraft(projectId: string): Promise<EditorProject | null> {
  const value: unknown = await done((await store(DRAFTS, "readonly")).get(projectId));
  return isEditorProject(value) ? value : null;
}

/** Imported files are kept in the browser only; they are never uploaded. */
export async function saveFile(projectId: string, fileKey: string, file: File): Promise<void> {
  const record: StoredFile = { fileKey, projectId, file };
  await done((await store(FILES, "readwrite")).put(record));
}

export async function loadProjectFiles(projectId: string): Promise<Map<string, File>> {
  const index = (await store(FILES, "readonly")).index("projectId");
  const records: unknown[] = await done(index.getAll(projectId));
  const files = new Map<string, File>();
  for (const record of records) {
    const stored = record as Partial<StoredFile>; // written only by saveFile above
    if (stored.fileKey && stored.file instanceof Blob) files.set(stored.fileKey, stored.file);
  }
  return files;
}

/** Drops stored files no clip refers to any more (deleted clips, cleared drafts). */
export async function deleteUnusedFiles(projectId: string, keep: Set<string>): Promise<void> {
  const files = await store(FILES, "readwrite");
  const keys: IDBValidKey[] = await done(files.index("projectId").getAllKeys(projectId));
  await Promise.all(
    keys.filter((key) => typeof key === "string" && !keep.has(key)).map((key) => done(files.delete(key))),
  );
}

export async function deleteDraft(projectId: string): Promise<void> {
  await done((await store(DRAFTS, "readwrite")).delete(projectId));
  await deleteUnusedFiles(projectId, new Set());
}
