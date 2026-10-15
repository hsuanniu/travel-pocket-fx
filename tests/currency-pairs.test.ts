import assert from "node:assert/strict";
import { test } from "node:test";
import { convertFxAmount, swapDirection } from "../src/utils/fx";
import { defaultAppState, loadAppState, saveAppState, loadPairRate, savePairRate } from "../src/utils/storage";
import { createSplitShareText } from "../src/utils/shareText";
import { fetchReferenceRate } from "../src/utils/rateApi";

const values = new Map<string, string>();
globalThis.window = { localStorage: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
} } as unknown as Window & typeof globalThis;

test("arbitrary pairs convert, swap, and round trip without a TWD base", () => {
  assert.equal(convertFxAmount(100, "USD", "JPY", 150), 15000);
  assert.equal(convertFxAmount(100, "EUR", "USD", 1.1), 110.00000000000001);
  const state = { ...defaultAppState, fromCurrency: "USD" as const, toCurrency: "JPY" as const, exchangeRate: 150 };
  const swapped = swapDirection(state);
  assert.equal(convertFxAmount(15000, swapped.fromCurrency, swapped.toCurrency, swapped.exchangeRate), 100);
  assert.equal(swapDirection(swapped).exchangeRate, 150);
  assert.equal(convertFxAmount(50, "USD", "USD", 1), 50);
});

test("old display-only currencies migrate once, keeping amounts and payer", () => {
  values.clear();
  for (const [key, value] of Object.entries({
    stateVersion: "1", fromCurrency: "JPY", toCurrency: "TWD",
    foreignCurrencyCode: "HKD", exchangeRate: "0.25", inputAmount: "4000",
    splitPayerName: "Test", splitTotalAmount: "4000", splitPeople: "4",
  })) values.set("travel-pocket-fx:" + key, value);
  const migrated = loadAppState();
  assert.equal(migrated.fromCurrency, "HKD");
  assert.equal(migrated.toCurrency, "TWD");
  assert.equal(migrated.exchangeRate, 4);
  assert.equal(migrated.splitPayerName, "Test");
  saveAppState(migrated);
  assert.deepEqual(loadAppState(), migrated);
  saveAppState({ ...migrated, fromCurrency: "EUR", toCurrency: "USD", exchangeRate: 1.1 });
  assert.equal(loadAppState().exchangeRate, 1.1);
  assert.equal(loadAppState().fromCurrency, "EUR");
});

test("legacy forward conversion does not relabel an existing foreign bill", () => {
  values.clear();
  for (const [key, value] of Object.entries({
    stateVersion: "1", fromCurrency: "TWD", toCurrency: "JPY",
    foreignCurrencyCode: "HKD", exchangeRate: "0.25", splitTotalAmount: "4000",
  })) values.set("travel-pocket-fx:" + key, value);
  const migrated = loadAppState();
  assert.equal(migrated.fromCurrency, "TWD");
  assert.equal(migrated.splitCurrencyCode, "HKD");
  assert.equal(migrated.splitTotalAmount, "4000");
  saveAppState(migrated);
  assert.equal(loadAppState().splitCurrencyCode, "HKD");
});

test("pair caches and reciprocal manual rates stay isolated", () => {
  values.clear();
  savePairRate("USD", "JPY", { source: "manual", date: "2026-10-15", rate: 150 });
  savePairRate("EUR", "USD", { source: "api", date: "2026-10-15", rate: 1.1 });
  assert.equal(loadPairRate("JPY", "USD")?.rate, 1 / 150);
  assert.equal(loadPairRate("JPY", "USD")?.source, "manual");
  assert.equal(loadPairRate("EUR", "USD")?.rate, 1.1);
});

test("share labels original, converted, payer, and rate amounts consistently", () => {
  const details = {
    date: "2026-10-15", payerName: "Alex", sourceCurrencyName: "日幣 (JPY)",
    targetCurrencyName: "美金 (USD)", rateBaseName: "日幣 (JPY)",
    rateTargetName: "美金 (USD)", displayExchangeRate: 0.0067,
    totalForeign: 4000, people: 4, perPersonForeign: 1000, perPersonConverted: 6.7,
  };
  const text = createSplitShareText(details);
  assert.ok(text.includes("總金額：4,000 日幣 (JPY)"));
  assert.ok(text.includes("每人：1,000 日幣 (JPY)（約 6.7 美金 (USD)）"));
  assert.ok(text.includes("其餘3人各需支付1,000 日幣 (JPY)給Alex"));
  assert.ok(text.includes("匯率：1 日幣 (JPY) = 0.0067 美金 (USD)"));
  assert.ok(!text.includes("台幣"));
  const withoutRate = createSplitShareText({ ...details, perPersonConverted: undefined, displayExchangeRate: 0 });
  assert.ok(!withoutRate.includes("匯率："));
  assert.ok(!withoutRate.includes("（約"));
});

test("reference API requests the selected pair and handles failures", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async (url) => {
      assert.equal(url, "https://api.frankfurter.dev/v2/rate/USD/JPY");
      return new Response(JSON.stringify({ rate: 150 }));
    };
    assert.equal(await fetchReferenceRate("USD", "JPY"), 150);
    globalThis.fetch = async () => { throw new Error("offline"); };
    assert.equal(await fetchReferenceRate("EUR", "USD"), null);
    assert.equal(await fetchReferenceRate("CUSTOM", "USD"), null);
  } finally { globalThis.fetch = originalFetch; }
});
