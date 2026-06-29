import { formatNumber } from "./formatMoney";

export type SplitShareDetails = {
  itemName?: string;
  date: string;
  foreignCurrencyName: string;
  totalJpy: number;
  people: number;
  perPersonJpy: number;
  exchangeRate: number;
  perPersonTwd: number;
};

export function createSplitShareText(details: SplitShareDetails): string {
  const optionalLines = [
    details.itemName?.trim() ? `消費項目：${details.itemName.trim()}` : null,
    details.date ? `日期：${formatDateForShare(details.date)}` : null,
  ].filter(Boolean);

  return [
    "💰 費用分攤",
    "",
    ...optionalLines,
    optionalLines.length > 0 ? "" : null,
    `總金額：${formatNumber(details.totalJpy)} ${details.foreignCurrencyName}`,
    `人數：${formatNumber(details.people)} 人`,
    `每人：${formatNumber(details.perPersonJpy)} ${details.foreignCurrencyName}（約 ${formatNumber(details.perPersonTwd)} 台幣）`,
    "",
    `匯率：1 台幣 = ${formatRateForShare(details.exchangeRate)} ${details.foreignCurrencyName}`,
    "",
    "———",
    "🐮 No Bull. Just Math.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function formatRateForShare(value: number): string {
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: 4,
  }).format(value);
}

function formatDateForShare(value: string): string {
  return value.replaceAll("-", "/");
}
