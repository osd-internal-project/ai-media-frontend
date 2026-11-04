import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { computeKioskLayout, KIOSK_DISPLAY_DEFAULT, parseKioskDisplay } from "./kiosk-display";

const round3 = (value: number) => Math.round(value * 1000) / 1000;

describe("computeKioskLayout", () => {
  test("full screen uses the real viewport at 1:1", () => {
    const layout = computeKioskLayout(KIOSK_DISPLAY_DEFAULT, { width: 1080, height: 1920 });
    assert.deepEqual(layout.screen, { width: 1080, height: 1920 });
    assert.equal(layout.fit, 1);
  });

  test("a stored small frame scales up to fill a bigger real screen", () => {
    const display = { ...KIOSK_DISPLAY_DEFAULT, frame: { width: 701, height: 1440 } };
    const layout = computeKioskLayout(display, { width: 1080, height: 1920 });
    assert.equal(round3(layout.fit), 1.333);
  });

  test("a portrait frame shrinks to fit a landscape screen", () => {
    const display = { ...KIOSK_DISPLAY_DEFAULT, frame: { width: 1080, height: 1920 } };
    const layout = computeKioskLayout(display, { width: 1440, height: 701 });
    assert.equal(round3(layout.fit), 0.365);
  });
});

describe("parseKioskDisplay", () => {
  test("broken JSON falls back to defaults", () => {
    assert.deepEqual(parseKioskDisplay("{oops"), KIOSK_DISPLAY_DEFAULT);
  });

  test("v1 settings saved before templateColumns existed still load", () => {
    const parsed = parseKioskDisplay('{"frame":{"width":1080,"height":1920},"scale":1.2,"margin":8}');
    assert.deepEqual(parsed, {
      frame: { width: 1080, height: 1920 },
      scale: 1.2,
      margin: 8,
      templateColumns: null,
    });
  });

  test("templateColumns keeps 1-6 and drops anything else", () => {
    assert.equal(parseKioskDisplay('{"templateColumns":2}').templateColumns, 2);
    assert.equal(parseKioskDisplay('{"templateColumns":9}').templateColumns, null);
    assert.equal(parseKioskDisplay('{"templateColumns":"3"}').templateColumns, null);
  });
});
