import type { Currency, CurrencyCode } from "./currencyTypes";

export const currencies: Record<CurrencyCode, Currency> = {
  JPY: {
    code: "JPY",
    name: "日本",
    symbol: "¥",
    flag: "🇯🇵",
    decimals: 0,
  },
  TWD: {
    code: "TWD",
    name: "台灣",
    symbol: "NT$",
    flag: "🇹🇼",
    decimals: 0,
  },
};
