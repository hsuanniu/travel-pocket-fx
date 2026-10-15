export type CurrencyCode = import("../../utils/displayCurrency").ForeignCurrencyCode;

export type Currency = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
};

export type ExchangeRate = {
  base: CurrencyCode;
  target: CurrencyCode;
  rate: number;
  updatedAt: number;
  source: "manual" | "default";
};
