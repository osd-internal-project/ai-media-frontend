import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { seatLevel } from "./seat";

describe("seatLevel", () => {
  test("null or missing limit is unlimited", () => {
    assert.equal(seatLevel(500, null), "unlimited");
    assert.equal(seatLevel(0, undefined), "unlimited");
  });

  test("a limit of 0 is full, even with nobody in the org", () => {
    assert.equal(seatLevel(0, 0), "full");
  });

  test("near from 80%, full at the limit or over it", () => {
    assert.equal(seatLevel(7, 10), "ok");
    assert.equal(seatLevel(8, 10), "near");
    assert.equal(seatLevel(10, 10), "full");
    assert.equal(seatLevel(12, 5), "full");
  });
});
