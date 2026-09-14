import { formatNumber } from "./formatMoney";

export type SplitShareDetails = {
  itemName?: string;
  payerName?: string;
  date: string;
  foreignCurrencyName: string;
  rateBaseName: string;
  rateTargetName: string;
  displayExchangeRate: number;
  totalForeign: number;
  people: number;
  perPersonForeign: number;
  exchangeRate: number;
  perPersonTwd?: number;
};

export function createSplitShareText(details: SplitShareDetails): string {
  const payerName = details.payerName?.trim() ?? "";
  const hasTwdEstimate = Number.isFinite(details.perPersonTwd) && Number(details.perPersonTwd) > 0;
  const hasRate = Number.isFinite(details.displayExchangeRate) && details.displayExchangeRate > 0;
  const optionalLines = [
    details.itemName?.trim() ? `消費項目：${details.itemName.trim()}` : null,
    payerName ? `付款人：${payerName}` : null,
    details.date ? `日期：${formatDateForShare(details.date)}` : null,
  ].filter(Boolean);
  const payerLines =
    payerName && details.people > 1
      ? [
          `${payerName}已先支付${formatNumber(details.totalForeign)} ${details.foreignCurrencyName}`,
          `其餘${formatNumber(details.people - 1)}人各需支付${formatNumber(details.perPersonForeign)} ${details.foreignCurrencyName}給${payerName}。`,
        ]
      : [];
  const rateLines = hasRate
    ? [
        "",
        `匯率：1 ${details.rateBaseName} = ${formatRateForShare(details.displayExchangeRate)} ${details.rateTargetName}`,
      ]
    : [];

  return [
    "💰 費用分攤",
    "",
    ...optionalLines,
    optionalLines.length > 0 ? "" : null,
    `總金額：${formatNumber(details.totalForeign)} ${details.foreignCurrencyName}`,
    `人數：${formatNumber(details.people)} 人`,
    hasTwdEstimate
      ? `每人：${formatNumber(details.perPersonForeign)} ${details.foreignCurrencyName}（約 ${formatNumber(Number(details.perPersonTwd))} 台幣）`
      : `每人：${formatNumber(details.perPersonForeign)} ${details.foreignCurrencyName}`,
    ...payerLines,
    ...rateLines,
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
