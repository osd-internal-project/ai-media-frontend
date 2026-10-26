import assert from "node:assert/strict";
import { describe, test } from "node:test";
import type { TMasterModelType } from "@/app/common/master-model-type.type";
import { getCapability } from "./workflow-capabilities";

const model = (sendConfig: TMasterModelType["sendConfig"]) =>
  ({ id: 1, sendConfig }) as TMasterModelType; // only sendConfig is read

describe("getCapability", () => {
  test("uses the type defaults when sendConfig sets no limits (seedance 2.0)", () => {
    const cap = getCapability(model({ type: "seedance2" }));
    assert.deepEqual(cap?.resolutions, ["480p", "720p", "1080p"]);
    assert.deepEqual(cap?.duration, { min: 4, max: 15 });
  });

  test("sendConfig.resolutions overrides the type list (seedance 2.0 mini)", () => {
    const cap = getCapability(
      model({ type: "seedance2", resolutions: ["480p", "720p"] }),
    );
    assert.deepEqual(cap?.resolutions, ["480p", "720p"]);
    assert.deepEqual(cap?.duration, { min: 4, max: 15 });
    assert.equal(cap?.maxInputs, 8);
  });

  test("sendConfig.duration overrides the type range (seedance 2.5)", () => {
    const cap = getCapability(
      model({ type: "seedance2", duration: { min: 4, max: 30 } }),
    );
    assert.deepEqual(cap?.duration, { min: 4, max: 30 });
    assert.deepEqual(cap?.resolutions, ["480p", "720p", "1080p"]);
  });

  test("returns undefined for unknown types and leaves the shared defaults untouched", () => {
    assert.equal(getCapability(model({ type: "unknown", resolutions: ["480p"] })), undefined);
    getCapability(model({ type: "seedance2", resolutions: ["480p"] }));
    assert.deepEqual(getCapability(model({ type: "seedance2" }))?.resolutions, [
      "480p",
      "720p",
      "1080p",
    ]);
  });
});
