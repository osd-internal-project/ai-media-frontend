import { getAccessToken } from "../axios/access-token";

/** ส่วนของ EventSource ที่หน้าจอใช้อยู่ — แทนกันได้โดยไม่ต้องแก้ handler เดิม */
export interface AuthEventStream {
  onmessage: ((event: { data: string }) => void) | null;
  /** `message` = เหตุผลจาก server เมื่ออ่านได้ (เช่น 403 "not a member") */
  onerror: ((message?: string) => void) | null;
  close: () => void;
}

/**
 * SSE ผ่าน `fetch` แทน `EventSource` เพราะ EventSource ส่ง `Authorization` ไม่ได้
 * (ใส่ token ใน query string จะหลุดลง access log ของ ingress)
 */
export function openAuthEventStream(url: string): AuthEventStream {
  const controller = new AbortController();
  let closed = false;
  const stream: AuthEventStream = {
    onmessage: null,
    onerror: null,
    close: () => {
      closed = true;
      controller.abort();
    },
  };
  const fail = (message?: string) => {
    if (!closed) stream.onerror?.(message);
  };

  (async () => {
    const token = await getAccessToken();
    const response = await fetch(url, {
      headers: {
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: controller.signal,
    });
    if (!response.ok || !response.body) {
      fail(await readErrorMessage(response));
      return;
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (!closed) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // event คั่นด้วยบรรทัดว่าง · ข้อมูลอยู่ในบรรทัด `data:` (หลายบรรทัดต่อกันด้วย \n)
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? "";
      for (const raw of events) {
        const data = raw
          .split(/\r?\n/)
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).replace(/^ /, ""))
          .join("\n");
        if (data && !closed) stream.onmessage?.({ data });
      }
    }
    // server ปิด stream ก่อนเราสั่ง close = จบผิดปกติ (เหมือน EventSource onerror)
    fail();
  })().catch(() => fail());

  return stream;
}

/** ข้อความ error ของ Nest (`{ message }`, อาจเป็น array จาก ValidationPipe) */
async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    const message = (body as { message?: unknown } | null)?.message; // body ของ Nest เป็น object เสมอ
    if (Array.isArray(message)) return message.join(", ");
    return typeof message === "string" ? message : undefined;
  } catch {
    return `Request failed (${response.status})`;
  }
}
