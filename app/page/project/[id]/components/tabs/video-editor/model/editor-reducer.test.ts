import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  HISTORY_LIMIT,
  createEditorState,
  editorReducer,
  type EditorAction,
  type EditorState,
} from "./editor-reducer";
import { makeItem, makeProject } from "./fixtures";

const run = (state: EditorState, ...actions: EditorAction[]) =>
  actions.reduce(editorReducer, state);

const video = (state: EditorState) => state.present.layers[0].items;
const music = (state: EditorState) => state.present.layers[1].items;

const twoClips = () =>
  createEditorState(
    makeProject([makeItem("a", { outPoint: 4 }), makeItem("b", { start: 4, outPoint: 6 })]),
  );

describe("video layer (free placement)", () => {
  test("add goes after the last clip", () => {
    const state = run(twoClips(), {
      type: "add-item",
      layerId: "video",
      item: makeItem("c", { start: 10, outPoint: 2 }),
    });
    assert.deepEqual(video(state).map((item) => [item.id, item.start]), [
      ["a", 0],
      ["b", 4],
      ["c", 10],
    ]);
  });

  test("an add with no room at its start lands after the last item", () => {
    const state = run(twoClips(), { type: "add-item", layerId: "video", item: makeItem("c", { start: 1, outPoint: 2 }) });
    assert.equal(video(state).find((item) => item.id === "c")?.start, 10);
  });

  test("remove leaves a gap", () => {
    const state = run(twoClips(), { type: "remove-item", layerId: "video", itemId: "a" });
    assert.deepEqual(video(state).map((item) => [item.id, item.start]), [["b", 4]]);
  });

  test("trimming the start moves the left edge right and keeps later clips in place", () => {
    const state = run(twoClips(), { type: "trim", layerId: "video", itemId: "b", inPoint: 2, outPoint: 6 });
    assert.deepEqual(video(state).map((item) => [item.id, item.start, item.inPoint]), [
      ["a", 0, 0],
      ["b", 6, 2],
    ]);
  });

  test("place moves a clip into free space", () => {
    const state = run(twoClips(), { type: "place", layerId: "video", itemId: "a", start: 20 });
    assert.deepEqual(video(state).map((item) => [item.id, item.start]), [
      ["b", 4],
      ["a", 20],
    ]);
  });

  test("split at playhead keeps total duration", () => {
    const state = run(twoClips(), { type: "split", layerId: "video", itemId: "b", time: 7, newId: "b2" });
    assert.deepEqual(video(state).map((item) => [item.id, item.start, item.inPoint, item.outPoint]), [
      ["a", 0, 0, 4],
      ["b", 4, 0, 3],
      ["b2", 7, 3, 6],
    ]);
  });

  test("duplicate goes to the end when there is no room right after the source", () => {
    const state = run(twoClips(), { type: "duplicate", layerId: "video", itemId: "a", newId: "a2" });
    assert.equal(video(state).find((item) => item.id === "a2")?.start, 10);
  });

  test("rename updates the export name", () => {
    assert.equal(run(twoClips(), { type: "rename", name: "Trip" }).present.name, "Trip");
  });
});

describe("music layer", () => {
  const withSong = () =>
    run(twoClips(), {
      type: "add-item",
      layerId: "music-1",
      item: makeItem("song", { start: 2, outPoint: 5 }),
    });

  test("add keeps the requested start", () => {
    assert.equal(music(withSong())[0].start, 2);
  });

  test("place moves freely", () => {
    const state = run(withSong(), { type: "place", layerId: "music-1", itemId: "song", start: 8 });
    assert.equal(music(state)[0].start, 8);
  });

  test("trimming the in-point keeps the audio anchored", () => {
    const state = run(withSong(), {
      type: "trim",
      layerId: "music-1",
      itemId: "song",
      inPoint: 1,
      outPoint: 5,
    });
    assert.deepEqual([music(state)[0].start, music(state)[0].inPoint], [3, 1]);
  });

  test("a trim toward a neighbour stops at its edge", () => {
    const state = run(
      withSong(),
      { type: "add-item", layerId: "music-1", item: makeItem("s2", { start: 8, inPoint: 2, outPoint: 6 }) },
    );
    const after = run(state, { type: "trim", layerId: "music-1", itemId: "s2", inPoint: 0, outPoint: 6 });
    assert.deepEqual([music(after)[1].start, music(after)[1].inPoint], [7, 1]);
  });

  test("add-layer adds a second music layer once", () => {
    const layer = { id: "music-2", kind: "music" as const, items: [] };
    const state = run(twoClips(), { type: "add-layer", layer }, { type: "add-layer", layer });
    assert.equal(state.present.layers.length, 3);
  });
});

describe("volume and aspect", () => {
  test("volume is clamped to 0..1", () => {
    const state = run(twoClips(), { type: "set-volume", layerId: "video", itemId: "a", volume: 3 });
    assert.equal(video(state)[0].volume, 1);
  });

  test("toggle-mute flips", () => {
    const state = run(twoClips(), { type: "toggle-mute", layerId: "video", itemId: "a" });
    assert.equal(video(state)[0].muted, true);
  });

  test("set-aspect changes the output ratio", () => {
    const state = run(twoClips(), { type: "set-aspect", aspect: "16:9" });
    assert.equal(state.present.aspect, "16:9");
  });
});

describe("history", () => {
  test("undo and redo walk the history", () => {
    const start = twoClips();
    const edited = run(start, { type: "remove-item", layerId: "video", itemId: "a" });
    const undone = run(edited, { type: "undo" });
    assert.equal(undone.present, start.present);
    const redone = run(undone, { type: "redo" });
    assert.equal(redone.present, edited.present);
  });

  test("a new edit clears the redo stack", () => {
    const state = run(
      twoClips(),
      { type: "remove-item", layerId: "video", itemId: "a" },
      { type: "undo" },
      { type: "toggle-mute", layerId: "video", itemId: "a" },
    );
    assert.equal(state.future.length, 0);
  });

  test("no-op edits do not create an undo step", () => {
    const state = twoClips();
    assert.equal(run(state, { type: "remove-item", layerId: "video", itemId: "missing" }), state);
    assert.equal(run(state, { type: "set-aspect", aspect: "9:16" }), state);
  });

  test("undo/redo at the ends are no-ops", () => {
    const state = twoClips();
    assert.equal(run(state, { type: "undo" }), state);
    assert.equal(run(state, { type: "redo" }), state);
  });

  test(`keeps at most ${HISTORY_LIMIT} steps`, () => {
    const actions: EditorAction[] = Array.from({ length: HISTORY_LIMIT + 5 }, () => ({
      type: "toggle-mute",
      layerId: "video",
      itemId: "a",
    }));
    assert.equal(run(twoClips(), ...actions).past.length, HISTORY_LIMIT);
  });

  test("load resets history", () => {
    const edited = run(twoClips(), { type: "toggle-mute", layerId: "video", itemId: "a" });
    const loaded = run(edited, { type: "load", project: makeProject() });
    assert.deepEqual([loaded.past.length, loaded.future.length], [0, 0]);
  });
});
