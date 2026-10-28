import assert from "node:assert/strict";
import { test } from "node:test";
import { convertFxAmount, swapDirection } from "../src/utils/fx";
import { defaultAppState, loadAppState, saveAppState, loadPairRate, savePairRate } from "../src/utils/storage";
import { createSplitShareText } from "../src/utils/shareText";
import { fetchReferenceRate } from "../src/utils/rateApi";
import { getLocalSplitDate, resolveSplitDate } from "../src/utils/splitDate";

test("automatic split dates follow local midnight while manual dates stay unchanged", () => {
  const before = new Date(2026, 9, 28, 23, 59);
  const after = new Date(2026, 9, 29, 0, 1);
  assert.equal(getLocalSplitDate(before), "2026/10/28");
  assert.equal(resolveSplitDate("2026/10/28", "auto", after), "2026/10/29");
  assert.equal(resolveSplitDate("2026/07/08", undefined, after), "2026/10/29");
  assert.equal(resolveSplitDate("2026/07/08", "manual", after), "2026/07/08");
  assert.equal(resolveSplitDate("", "manual", after), "");
});

const values = new Map<string, string>();
globalThis.window = { localStorage: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
} } as unknown as Window & typeof globalThis;

test("reload refreshes automatic dates but preserves explicit dates and amounts", () => {
  values.clear();
  saveAppState({ ...defaultAppState, splitDate: "2026/07/08", splitTotalAmount: "2340" });
  assert.equal(loadAppState().splitDate, getLocalSplitDate());
  assert.equal(loadAppState().splitTotalAmount, "2340");
  values.delete("travel-pocket-fx:splitDateMode");
  assert.equal(loadAppState().splitDate, getLocalSplitDate());
  saveAppState({ ...loadAppState(), splitDate: "2026/07/08", splitDateMode: "manual" });
  assert.equal(loadAppState().splitDate, "2026/07/08");
  assert.equal(loadAppState().splitDateMode, "manual");
});

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
    sourceCurrencyCode: "JPY", targetCurrencyCode: "USD",
    rateTargetName: "美金 (USD)", displayExchangeRate: 0.0067,
    totalForeign: 4000, people: 4, perPersonForeign: 1000, perPersonConverted: 6.7,
  };
  const text = createSplitShareText(details);
  assert.ok(text.includes("總金額\nJPY 4,000"));
  assert.ok(text.includes("每人應付\nJPY 1,000"));
  assert.ok(text.includes("每人換算參考\n約 USD 6.7"));
  assert.ok(text.includes("付款人（已代付總額）\nAlex"));
  assert.ok(text.includes("其餘 3 人\n請各付上述「每人應付」金額\n給付款人。"));
  assert.ok(text.includes("參考匯率\n1 JPY\n= 0.0067 USD"));
  assert.ok(!text.includes("台幣"));
  const withoutRate = createSplitShareText({ ...details, perPersonConverted: undefined, displayExchangeRate: 0 });
  assert.ok(!withoutRate.includes("參考匯率"));
  assert.ok(!withoutRate.includes("每人換算參考"));
});

test("chat layout preserves long names, custom currency and large amounts without injected lines", () => {
  const name = "Alex 陳大文 Very Long Family Name";
  const text = createSplitShareText({
    date: "2026-10-15", payerName: `  ${name}\n `,
    itemName: "多人海外旅行的晚餐與交通費用\n第二天", sourceCurrencyName: "自訂旅行點數",
    targetCurrencyName: "歐元", sourceCurrencyCode: "CUSTOM", targetCurrencyCode: "EUR",
    rateBaseName: "自訂旅行點數", rateTargetName: "歐元", displayExchangeRate: 0,
    totalForeign: 123456789000, perPersonForeign: 30864197250, people: 4,
  });
  assert.ok(text.includes(`付款人（已代付總額）\n${name}\n\n`));
  assert.ok(text.includes("消費項目\n多人海外旅行的晚餐與交通費用 第二天"));
  assert.ok(text.includes("自訂旅行點數 123,456,789,000"));
  assert.ok(!text.includes("CUSTOM"));
  assert.ok(!text.includes("\n\n\n"));
});

test("empty optional fields and a single person omit unnecessary payment instructions", () => {
  const text = createSplitShareText({
    date: "", payerName: "  ", itemName: "\n", sourceCurrencyName: "台幣",
    targetCurrencyName: "歐元", sourceCurrencyCode: "TWD", targetCurrencyCode: "EUR",
    rateBaseName: "台幣", rateTargetName: "歐元", displayExchangeRate: 0,
    totalForeign: 2340, perPersonForeign: 2340, people: 1,
  });
  for (const omitted of ["付款人", "消費項目", "日期", "其餘", "換算參考", "參考匯率"]) assert.ok(!text.includes(omitted));
  assert.ok(text.includes("每人應付\nTWD 2,340"));
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
