export type ForeignCurrencyCode =
  | "JPY"
  | "KRW"
  | "USD"
  | "EUR"
  | "HKD"
  | "CNY"
  | "VND"
  | "THB"
  | "CUSTOM";

export type ForeignCurrencyDisplay = {
  code: ForeignCurrencyCode;
  flag: string;
  name: string;
  symbol: string;
};

export const foreignCurrencyOptions: ForeignCurrencyDisplay[] = [
  { code: "JPY", flag: "🇯🇵", name: "日幣", symbol: "¥" },
  { code: "KRW", flag: "🇰🇷", name: "韓元", symbol: "₩" },
  { code: "USD", flag: "🇺🇸", name: "美金", symbol: "$" },
  { code: "EUR", flag: "🇪🇺", name: "歐元", symbol: "€" },
  { code: "HKD", flag: "🇭🇰", name: "港幣", symbol: "HK$" },
  { code: "CNY", flag: "🇨🇳", name: "人民幣", symbol: "¥" },
  { code: "VND", flag: "🇻🇳", name: "越南盾", symbol: "₫" },
  { code: "THB", flag: "🇹🇭", name: "泰銖", symbol: "฿" },
  { code: "CUSTOM", flag: "✏️", name: "自訂", symbol: "" },
];

export function getForeignCurrencyDisplay(
  code: ForeignCurrencyCode,
  customName: string,
): ForeignCurrencyDisplay {
  const option = foreignCurrencyOptions.find((currency) => currency.code === code);

  if (code === "CUSTOM") {
    return {
      code,
      flag: "✏️",
      name: customName.trim() || "外幣",
      symbol: "",
    };
  }

  return option ?? foreignCurrencyOptions[0];
}

export function getForeignCurrencyUnit(currency: ForeignCurrencyDisplay): string {
  return currency.code === "CUSTOM" ? currency.name : currency.code;
}
