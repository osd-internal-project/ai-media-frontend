import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { nameColor, parseHexList, quantize } from "./color-import";

describe("parseHexList", () => {
  test("reads codes with or without #, expands short ones, and drops repeats", () => {
    assert.deepEqual(
      parseHexList("Primary #d62a84, blue: 155791\n#fff and #FFF; again #D62A84"),
      ["#D62A84", "#155791", "#FFFFFF"],
    );
  });

  test("does not take ordinary words or longer strings for colours", () => {
    assert.deepEqual(parseHexList("facade decade bad ace #12345678 abc1234"), []);
  });

  test("reads a CSS variable list", () => {
    assert.deepEqual(
      parseHexList("--pink: #E086B4;\n--blue:#7BB9D1;"),
      ["#E086B4", "#7BB9D1"],
    );
  });

  test("stops at the limit", () => {
    assert.equal(parseHexList("#111111 #222222 #333333", 2).length, 2);
  });
});

describe("nameColor", () => {
  test("names hue and lightness in plain words", () => {
    assert.equal(nameColor("#155791"), "Blue");
    assert.equal(nameColor("#7BB9D1"), "Teal");
    assert.equal(nameColor("#D62A84"), "Pink");
    assert.equal(nameColor("#F0BC4D"), "Orange");
    assert.equal(nameColor("#FF4B18"), "Red");
    assert.equal(nameColor("#0B2A4A"), "Dark Blue");
    assert.equal(nameColor("#FAD4E6"), "Light Pink");
  });

  test("names colours without hue", () => {
    assert.equal(nameColor("#FFFFFF"), "White");
    assert.equal(nameColor("#000000"), "Black");
    assert.equal(nameColor("#808080"), "Gray");
    assert.equal(nameColor("#5A3A1E"), "Brown");
  });
});

describe("quantize", () => {
  const pixels = (...colors: [number, number, number, number, number][]) =>
    colors.flatMap(([r, g, b, a, times]) =>
      Array.from({ length: times }, () => [r, g, b, a]).flat(),
    );

  test("returns the most common colours first and merges near-identical ones", () => {
    const data = pixels(
      [214, 42, 132, 255, 50],
      [21, 87, 145, 255, 30],
      [216, 44, 134, 255, 20], // same pink, slightly off
      [255, 255, 255, 255, 5],
    );
    assert.deepEqual(quantize(data, 3), ["#D72B85", "#155791", "#FFFFFF"]);
  });

  test("ignores transparent pixels and copes with an empty image", () => {
    assert.deepEqual(quantize(pixels([255, 0, 0, 0, 10], [0, 0, 255, 255, 1])), ["#0000FF"]);
    assert.deepEqual(quantize([]), []);
  });
});
