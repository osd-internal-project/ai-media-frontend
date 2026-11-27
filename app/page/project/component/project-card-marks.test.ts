import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { pickByName, projectInitials } from "./project-card-marks";

describe("projectInitials", () => {
  test("two words take the first letter of each", () => {
    assert.equal(projectInitials("P'yeen V2"), "PV");
    assert.equal(projectInitials("Chalee's Work"), "CW");
    assert.equal(projectInitials("AI Cave 1 วันสุดท้าย"), "AC");
  });
  test("one word takes its first two letters", () => {
    assert.equal(projectInitials("test"), "TE");
    assert.equal(projectInitials("  Test  "), "TE");
  });
  test("Thai skips a leading vowel instead of showing it alone", () => {
    assert.equal(projectInitials("เสา OSD"), "สO");
    assert.equal(projectInitials("โปรเจกต์"), "ปร");
  });
  test("empty or punctuation-only names fall back to ?", () => {
    assert.equal(projectInitials(""), "?");
    assert.equal(projectInitials("   "), "?");
    assert.equal(projectInitials("-- !!"), "?");
  });
});

describe("pickByName", () => {
  const palette = ["a", "b", "c"] as const;
  test("is stable for the same name", () => {
    assert.equal(pickByName("Taksapong", palette), pickByName("Taksapong", palette));
  });
  test("always returns a palette entry", () => {
    for (const n of ["", "SI", "TA", "AR", "สมชาย"]) assert.ok(palette.includes(pickByName(n, palette)));
  });
});
