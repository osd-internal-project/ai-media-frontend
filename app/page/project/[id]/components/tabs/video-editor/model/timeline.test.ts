import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeItem, makeProject } from "./fixtures";
import {
  MIN_ITEM_DURATION,
  gapAround,
  itemAt,
  placeItem,
  projectDuration,
  splitItem,
  trimInPlace,
  trimItem,
} from "./timeline";

describe("projectDuration", () => {
  test("is the latest end across layers", () => {
    const project = makeProject(
      [makeItem("a", { outPoint: 4 })],
      [makeItem("m", { start: 2, outPoint: 6 })],
    );
    assert.equal(projectDuration(project), 8);
  });

  test("is 0 for an empty project", () => {
    assert.equal(projectDuration(makeProject()), 0);
  });
});

describe("itemAt", () => {
  const layer = {
    id: "v",
    kind: "video" as const,
    items: [makeItem("a", { outPoint: 3 }), makeItem("b", { start: 3, outPoint: 2 })],
  };

  test("finds the item under the playhead, end exclusive", () => {
    assert.equal(itemAt(layer, 0)?.id, "a");
    assert.equal(itemAt(layer, 3)?.id, "b");
  });

  test("returns null past the end", () => {
    assert.equal(itemAt(layer, 5), null);
  });
});

describe("trimItem", () => {
  test("clamps to the source bounds", () => {
    const trimmed = trimItem(makeItem("a"), -2, 15);
    assert.equal(trimmed.inPoint, 0);
    assert.equal(trimmed.outPoint, 10);
  });

  test("keeps the minimum duration when handles cross", () => {
    const trimmed = trimItem(makeItem("a"), 6, 5);
    assert.equal(trimmed.inPoint, 6);
    assert.equal(trimmed.outPoint, 6 + MIN_ITEM_DURATION);
  });
});

describe("splitItem", () => {
  test("cuts at timeline time, mapping into source time", () => {
    const item = makeItem("a", { start: 5, inPoint: 2, outPoint: 8 });
    const halves = splitItem(item, 7, "a2");
    assert.ok(halves);
    const [left, right] = halves;
    assert.deepEqual([left.inPoint, left.outPoint], [2, 4]);
    assert.deepEqual([right.id, right.start, right.inPoint, right.outPoint], ["a2", 7, 4, 8]);
  });

  test("refuses a cut at the edge or outside the item", () => {
    const item = makeItem("a", { start: 5, outPoint: 4 });
    assert.equal(splitItem(item, 5, "x"), null);
    assert.equal(splitItem(item, 9, "x"), null);
    assert.equal(splitItem(item, 20, "x"), null);
  });
});

describe("placeItem", () => {
  const items = [
    makeItem("m1", { start: 0, outPoint: 4 }),
    makeItem("m2", { start: 10, outPoint: 4 }),
  ];

  test("moves into a free gap", () => {
    const placed = placeItem(items, "m2", 5);
    assert.equal(placed.find((item) => item.id === "m2")?.start, 5);
  });

  test("clamps against the previous item and 0", () => {
    assert.equal(placeItem(items, "m2", 3).find((item) => item.id === "m2")?.start, 4);
    assert.equal(placeItem(items, "m1", -3).find((item) => item.id === "m1")?.start, 0);
  });

  test("keeps the list when the gap is too small", () => {
    const tight = [
      makeItem("m1", { start: 0, outPoint: 4 }),
      makeItem("m2", { start: 5, outPoint: 4 }),
      makeItem("m3", { start: 20, outPoint: 4 }),
    ];
    assert.equal(placeItem(tight, "m3", 3), tight);
  });

  test("ignores an unknown id", () => {
    assert.equal(placeItem(items, "missing", 3), items);
  });
});

describe("gapAround", () => {
  test("is bounded by the neighbours", () => {
    const items = [
      makeItem("a", { start: 0, outPoint: 2 }),
      makeItem("b", { start: 5, outPoint: 2 }),
      makeItem("c", { start: 10, outPoint: 2 }),
    ];
    assert.deepEqual(gapAround(items, items[1]), { min: 2, max: 10 });
    assert.deepEqual(gapAround(items, items[0]), { min: 0, max: 5 });
    assert.equal(gapAround(items, items[2]).max, Number.POSITIVE_INFINITY);
  });
});

describe("trimInPlace", () => {
  const items = [
    makeItem("a", { start: 0, outPoint: 4 }),
    makeItem("b", { start: 6, inPoint: 2, outPoint: 6 }),
    makeItem("c", { start: 12, outPoint: 4 }),
  ];

  test("moving the in-point right moves the left edge right and leaves a gap", () => {
    const next = trimInPlace(items, items[1], 3, 6);
    assert.deepEqual([next?.start, next?.inPoint, next?.outPoint], [7, 3, 6]);
  });

  test("extending left stops at the previous item", () => {
    const next = trimInPlace(items, items[1], 0, 6);
    assert.deepEqual([next?.start, next?.inPoint], [4, 0]);
  });

  test("extending right stops at the next item", () => {
    const next = trimInPlace(items, items[0], 0, 10);
    assert.equal(next?.outPoint, 6);
  });
});
