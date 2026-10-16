import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { estimateMegabytes, outputSize } from "./limits";

describe("outputSize", () => {
  test("maps aspect and resolution to even pixel sizes", () => {
    assert.deepEqual(outputSize("9:16", "720p"), { width: 720, height: 1280 });
    assert.deepEqual(outputSize("16:9", "1080p"), { width: 1920, height: 1080 });
    assert.deepEqual(outputSize("1:1", "720p"), { width: 720, height: 720 });
  });
});

describe("estimateMegabytes", () => {
  test("grows with length and resolution, never below 1", () => {
    assert.equal(estimateMegabytes(0, "720p"), 1);
    assert.ok(estimateMegabytes(60, "1080p") > estimateMegabytes(60, "720p"));
  });
});
