import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { copyName, copyPayload, priceLabel } from "./plan-utils";

describe("priceLabel", () => {
  test("THB uses the baht sign and Thai unit", () => {
    assert.equal(priceLabel({ price: 1290, currency: "THB", interval: "MONTH", periodCount: 0 }), "฿1,290 / เดือน");
  });
  test("multi-period and other currencies", () => {
    assert.equal(priceLabel({ price: 99, currency: "usd", interval: "YEAR", periodCount: 2 }), "99 USD / 2 ปี");
  });
  test("missing price shows zero, not NaN", () => {
    assert.equal(priceLabel({ price: undefined as unknown as number, currency: "", interval: "DAY" }), "฿0 / วัน");
  });
});

describe("copyName", () => {
  test("adds a number when the copy name is taken", () => {
    assert.equal(copyName("Pro", ["Pro"]), "Pro (copy)");
    assert.equal(copyName("Pro", ["Pro", "Pro (copy)", "Pro (copy 2)"]), "Pro (copy 3)");
  });
});

describe("copyPayload", () => {
  test("copy is off, not default, and drops old row ids", () => {
    const payload = copyPayload(
      {
        id: "p1",
        name: "Pro",
        description: null,
        badge: null,
        isPopular: true,
        popular: true,
        borderColor: null,
        isDefault: true,
        status: true,
        accessCodes: ["image"],
        allowedModelIds: [3],
        prices: [{ id: "price-1", planId: "p1", interval: "MONTH", price: 990, duration: 30, creditAllowance: 0, imageAllowance: 0, currency: "THB", isDefault: true, orderIndex: 0 }],
        features: [{ id: "f1", featureId: "ft1", key: "seats", label: "Seats", icon: null, text: "5", isHighlight: false, category: "General", orderIndex: 0 }],
      },
      ["Pro"],
    );
    assert.equal(payload.name, "Pro (copy)");
    assert.equal(payload.status, false);
    assert.equal(payload.isDefault, false);
    assert.equal(payload.popular, false);
    assert.deepEqual(payload.allowedModelIds, [3]);
    assert.equal("id" in payload.prices[0], false);
    assert.equal("planId" in payload.prices[0], false);
    assert.equal("id" in payload.features[0], false);
    assert.equal(payload.features[0].key, "seats");
  });
});
