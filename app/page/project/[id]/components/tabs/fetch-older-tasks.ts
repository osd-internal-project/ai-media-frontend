/** จำนวน task ต่อครั้งตอน scroll ขึ้นดูประวัติ */
export const HISTORY_PAGE_SIZE = 1;

const MAX_CURSOR_STEPS = 5;

interface IPagedTask {
  id?: unknown;
  seq?: number | null;
}

type TOlderTasksResult<T> =
  | { status: "found"; items: T[]; cursor: number }
  | { status: "end" }
  | { status: "error" };

/**
 * ดึง task ที่เก่ากว่า cursor (`fristsql`) — task ที่มีหลายแถวอาจถูกคืนซ้ำ
 * จึงเลื่อน cursor ต่อจนเจอ task ใหม่, หมดจริง (`end`) หรือ request พัง (`error`)
 */
export const fetchOlderTasks = async <T extends IPagedTask>(
  cursor: number | undefined,
  knownIds: ReadonlySet<unknown>,
  fetchPage: (fristsql: number | undefined) => Promise<T[] | undefined>,
): Promise<TOlderTasksResult<T>> => {
  let nextCursor = cursor;
  for (let step = 0; step < MAX_CURSOR_STEPS; step++) {
    const data = await fetchPage(nextCursor);
    if (!data) return { status: "error" };
    if (data.length === 0) return { status: "end" };

    const seqValues = data
      .map((task) => task.seq)
      .filter((seq): seq is number => typeof seq === "number");
    if (seqValues.length === 0) return { status: "end" };
    nextCursor = Math.min(...seqValues);

    const items = data.filter((task) => !knownIds.has(task.id));
    if (items.length > 0) return { status: "found", items, cursor: nextCursor };
  }
  // ซ้ำครบทุกรอบ — เก็บ cursor ที่เลื่อนแล้ว ให้ scroll ครั้งถัดไปไปต่อจากตรงนี้
  return nextCursor === undefined
    ? { status: "end" }
    : { status: "found", items: [], cursor: nextCursor };
};
