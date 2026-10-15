import { formatNumber } from "./formatMoney";

export type SplitShareDetails = {
  itemName?: string;
  payerName?: string;
  date: string;
  sourceCurrencyName: string;
  targetCurrencyName: string;
  sourceCurrencyCode?: string;
  targetCurrencyCode?: string;
  rateBaseName: string;
  rateTargetName: string;
  displayExchangeRate: number;
  totalForeign: number;
  people: number;
  perPersonForeign: number;
  perPersonConverted?: number;
};

export function createSplitShareText(details: SplitShareDetails): string {
  const payerName = cleanText(details.payerName);
  const itemName = cleanText(details.itemName);
  const source = currencyLabel(details.sourceCurrencyCode, details.sourceCurrencyName);
  const target = currencyLabel(details.targetCurrencyCode, details.targetCurrencyName);
  const hasConvertedEstimate = Number.isFinite(details.perPersonConverted) && Number(details.perPersonConverted) > 0;
  const hasRate = Number.isFinite(details.displayExchangeRate) && details.displayExchangeRate > 0;
  // Separate labels and values so chat bubbles can wrap without splitting a sentence.
  const sections: string[] = ["💰 費用分攤"];
  if (itemName) sections.push(`消費項目\n${itemName}`);
  if (details.date) sections.push(`日期：${formatDateForShare(cleanText(details.date))}`);
  sections.push(`每人應付\n${source} ${formatNumber(details.perPersonForeign)}`);
  if (hasConvertedEstimate) {
    sections.push(`每人換算參考\n約 ${target} ${formatNumber(Number(details.perPersonConverted))}`);
  }
  sections.push(`總金額\n${source} ${formatNumber(details.totalForeign)}\n分攤人數：${formatNumber(details.people)} 人${payerName ? "（含付款人）" : ""}`);
  if (payerName) {
    sections.push(`付款人（已代付總額）\n${payerName}`);
    if (details.people > 1) sections.push(`其餘 ${formatNumber(details.people - 1)} 人\n請各付上述「每人應付」金額\n給付款人。`);
  }
  if (hasRate) {
    sections.push(`參考匯率\n1 ${source}\n= ${formatRateForShare(details.displayExchangeRate)} ${target}`);
  }
  sections.push("———\n🐮 No Bull. Just Math.");
  return sections.join("\n\n");
}

function cleanText(value?: string): string {
  return (value ?? "").replace(/\s+/gu, " ").trim();
}

function currencyLabel(code: string | undefined, name: string): string {
  return code && code !== "CUSTOM" ? cleanText(code) : cleanText(name);
}

function formatRateForShare(value: number): string {
  return new Intl.NumberFormat("zh-TW", {
    maximumSignificantDigits: 8,
  }).format(value);
}

function formatDateForShare(value: string): string {
  return value.replaceAll("-", "/");
}
